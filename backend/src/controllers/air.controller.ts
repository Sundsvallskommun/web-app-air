import ApiService from '@/services/api.service';
import { logger } from '@/utils/logger';
import dayjs from 'dayjs';
import { Controller, Get, Param } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

const DATE_FORMAT = 'YYYY-MM-DD';
const TIME_SUFFIX = 'T07%3A00%3A00Z';

@Controller()
export class AirController {
  private apiService = new ApiService();

  @Get('/airquality/:filter')
  @OpenAPI({ summary: 'get quality report of air in Sundsvall' })
  async getAirQualityReports(@Param('filter') filter: string): Promise<{ data; message: string }> {
    const today = dayjs('2025-04-25');
    const todayFormatted = today.format(DATE_FORMAT);
    const hours = today.format('HH');
    const minutes = today.format('mm');
    const currentTimeSuffix = `T${hours}%3A${minutes}%3A00Z`;

    let filterString = '';

    switch (filter) {
      case 'day':
        filterString = `?from=${today.subtract(1, 'day').format(DATE_FORMAT)}${currentTimeSuffix}&to=${todayFormatted}${currentTimeSuffix}`;
        break;
      case 'fourdays':
        filterString = `?from=${today.subtract(4, 'day').format(DATE_FORMAT)}${currentTimeSuffix}&to=${todayFormatted}${currentTimeSuffix}`;
        break;
      case 'week':
        filterString = `?from=${today.subtract(7, 'day').format(DATE_FORMAT)}${TIME_SUFFIX}&to=${todayFormatted}${TIME_SUFFIX}`;
        break;
      case 'month':
        filterString = `?from=${today.subtract(1, 'month').format(DATE_FORMAT)}${TIME_SUFFIX}&to=${todayFormatted}${TIME_SUFFIX}`;
        break;
      case 'year':
        filterString = `?from=${today.subtract(1, 'year').format(DATE_FORMAT)}${TIME_SUFFIX}&to=${todayFormatted}${TIME_SUFFIX}`;
        break;
    }

    const url = `/opendata/1.0/airqualities/urn%3Angsi-ld%3AAirQualityObserved%3A888100${filterString}`;
    const res = await this.apiService.get({ url }).catch(e => {
      logger.error('Error when fetching air quality');
      throw e;
    });
    return { data: res.data, message: 'success' };
  }
}
