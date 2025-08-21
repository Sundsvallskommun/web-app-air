import ApiExternalService from '@/services/api-external.service ';
import { logger } from '@/utils/logger';
import { Controller, Get } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

@Controller()
export class AirController {
  private apiService = new ApiExternalService();

  @Get('/airquality')
  @OpenAPI({ summary: 'get quality report of air in Sundsvall' })
  async getAirQualityReports(): Promise<{ data; message: string }> {
    const currentDate = `${new Date().getFullYear()}-${new Date().getMonth() + 1 > 9 ? new Date().getMonth() + 1 : '0' + (new Date().getMonth() + 1)}-${new Date().getDate() > 9 ? new Date().getDate() : '0' + new Date().getDate()}`;

    const lastYearsDate = `${new Date().getFullYear() - 1}-${new Date().getMonth() + 1 > 9 ? new Date().getMonth() + 1 : '0' + (new Date().getMonth() + 1)}-${new Date().getDate() > 9 ? new Date().getDate() : '0' + new Date().getDate()}`;

    const url = `/opendata/1.0/airqualities/urn%3Angsi-ld%3AAirQualityObserved%3A888100?from=${lastYearsDate}T07%3A00%3A00Z&to=${currentDate}T07%3A00%3A00Z`;
    const res = await this.apiService.get({ url }).catch(e => {
      logger.error('Error when fetching air quality');
      throw e;
    });
    return { data: res.data, message: 'success' };
  }
}
