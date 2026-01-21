import { HttpException } from '@exceptions/HttpException';
import { User } from '@interfaces/users.interface';
import { logger } from '@utils/logger';
import { apiURL } from '@utils/util';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import ApiTokenService from './api-token.service';

export class ApiResponse<T> {
  data: T;
  message: string;
}

const apiTokenService = new ApiTokenService();

const API_TIMEOUT_MS = 30000; // 30 seconds timeout for slow Opendata API
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000; // 1 second, then 2s, 4s (exponential backoff)

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const isRetryableError = (error: AxiosError): boolean => {
  // Retry on timeout, connection reset, socket hangup
  const retryableCodes = ['ECONNABORTED', 'ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED'];
  if (error.code && retryableCodes.includes(error.code)) {
    return true;
  }
  if (error.message?.includes('socket hang up')) {
    return true;
  }
  // Retry on 502, 503, 504 status codes
  const retryableStatuses = [502, 503, 504];
  if (error.response?.status && retryableStatuses.includes(error.response.status)) {
    return true;
  }
  return false;
};

class ApiService {
  private instance: AxiosInstance;
  constructor() {
    this.instance = axios.create({
      timeout: API_TIMEOUT_MS,
    });
    this.instance.interceptors.request.use(
      async function (request) {
        if (request.url === apiURL('token')) {
          return Promise.resolve(request);
        }
        const token = await apiTokenService.getToken();
        const defaultHeaders = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Request-Id': uuidv4(),
        };
        logger.info(`x-request-id: ${defaultHeaders['X-Request-Id']}`);
        request.headers = { ...defaultHeaders, ...request.headers } as any;
        request.headers['Content-Type'] = request.headers['Content-Type'] || defaultHeaders['Content-Type'];
        return Promise.resolve(request);
      },
      function (error) {
        return Promise.reject(error);
      },
    );

    this.instance.interceptors.response.use(
      async function (response) {
        // TODO This is an ugly workaround for the fact that setting correct API version
        // in the location header is difficult for some APIs, such as Messaging
        // So, for Messaging specifically, we - for now - ignore the location header
        const token = await apiTokenService.getToken();
        const defaultHeaders = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Request-Id': uuidv4(),
        };
        if (response.headers.location && !response.config.url.includes('messaging')) {
          logger.info(`Response contained location header: ${response.headers.location}`);
          logger.info(`Base URL was: ${response.config.baseURL}`);
          return axios.get(response.headers.location, { baseURL: response.config.baseURL, headers: defaultHeaders }).catch(e => {
            logger.error(`Error in location header request: ${e.details}`);
            logger.error(`Base URL was: ${e.config?.baseURL}`);
            logger.error(`URL was: ${e.config?.url}`);
            logger.error(`Method was: ${e.config?.method}`);
            return Promise.resolve(response);
          });
        }
        return Promise.resolve(response);
      },
      function (error) {
        return Promise.reject(error);
      },
    );
  }
  private async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const defaultParams = {};
    const preparedConfig: AxiosRequestConfig = {
      ...config,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      headers: { ...config.headers },
      params: { ...defaultParams, ...config.params },
      url: config.baseURL ? config.url : apiURL(config.url),
    };

    let lastError: AxiosError | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          const delayMs = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
          logger.info(`Retry attempt ${attempt}/${MAX_RETRIES} after ${delayMs}ms delay`);
          await sleep(delayMs);
        }

        const res = await this.instance(preparedConfig);
        return { data: res.data, message: 'success' };
      } catch (error: unknown | AxiosError) {
        if (axios.isAxiosError(error) && isRetryableError(error) && attempt < MAX_RETRIES) {
          logger.warn(`Retryable error on attempt ${attempt + 1}/${MAX_RETRIES + 1}: ${error.code || error.message}`);
          lastError = error;
          continue;
        }
        // Non-retryable error or max retries reached - handle below
        lastError = axios.isAxiosError(error) ? error : null;
        break;
      }
    }

    // If we get here, all retries failed or we hit a non-retryable error
    const error = lastError;
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;

        // Handle timeout errors
        if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
          logger.error(`ERROR: API request timed out after ${API_TIMEOUT_MS}ms (${MAX_RETRIES + 1} attempts)`);
          logger.error(`Error url: ${axiosError.config?.baseURL || ''}${axiosError.config?.url}`);
          throw new HttpException(504, 'Gateway timeout - external API took too long to respond');
        }

        // Handle connection errors (socket hangup, etc.)
        if (axiosError.code === 'ECONNRESET' || axiosError.code === 'ECONNREFUSED' || axiosError.message?.includes('socket hang up')) {
          logger.error(`ERROR: API connection error after ${MAX_RETRIES + 1} attempts: ${axiosError.code || axiosError.message}`);
          logger.error(`Error url: ${axiosError.config?.baseURL || ''}${axiosError.config?.url}`);
          throw new HttpException(502, 'Bad gateway - external API connection failed');
        }

        // Handle 404
        if (axiosError.response?.status === 404) {
          logger.error(`ERROR: API request failed with status: ${axiosError.response?.status}`);
          logger.error(`Error details: ${JSON.stringify(axiosError.response.data)}`);
          logger.error(`Error url: ${axiosError.response.config.baseURL || ''}/${axiosError.response.config.url}`);
          logger.error(`Error data: ${axiosError.response.config.data?.slice(0, 1500)}`);
          logger.error(`Error method: ${axiosError.response.config.method}`);
          throw new HttpException(404, 'Not found');
        }

        // Handle other response errors
        if (axiosError.response?.data) {
          logger.error(`ERROR: API request failed with status: ${axiosError.response?.status}`);
          logger.error(`Error details: ${JSON.stringify(axiosError.response.data)}`);
          logger.error(`Error url: ${axiosError.response.config.baseURL || ''}/${axiosError.response.config.url}`);
          logger.error(`Error data: ${axiosError.response.config.data?.slice(0, 1500)}`);
          logger.error(`Error method: ${axiosError.response.config.method}`);
        }
    } else {
      logger.error(`Unknown error after ${MAX_RETRIES + 1} attempts: ${error}`);
    }
    throw new HttpException(500, 'Internal server error');
  }

  public async get<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    logger.info(`MAKING GET REQUEST TO URL ${config.baseURL ? config.baseURL + '/' : ''}${config.url}`);
    return this.request<T>({ ...config, method: 'GET' });
  }

  public async post<T, D>(config: AxiosRequestConfig<D>): Promise<ApiResponse<T>> {
    logger.info(`MAKING POST REQUEST TO URL ${config.baseURL ? config.baseURL + '/' : ''}${config.url}`);
    return this.request<T>({ ...config, method: 'POST' });
  }

  public async patch<T, D>(config: AxiosRequestConfig<D>): Promise<ApiResponse<T>> {
    logger.info(`MAKING PATCH REQUEST TO URL ${config.baseURL ? config.baseURL + '/' : ''}${config.url}`);
    return this.request<T>({ ...config, method: 'PATCH' });
  }

  public async put<T, D>(config: AxiosRequestConfig<D>): Promise<ApiResponse<T>> {
    logger.info(`MAKING PUT REQUEST TO URL ${config.baseURL ? config.baseURL + '/' : ''}${config.url}`);
    return this.request<T>({ ...config, method: 'PUT' });
  }

  public async delete<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE' });
  }
}
export default ApiService;
