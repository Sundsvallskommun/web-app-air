import ApiService from '@/services/api.service';
import { logger } from '@/utils/logger';
import { Controller, Get, Param } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

@Controller()
export class AirController {
  private apiService = new ApiService();

  @Get('/airquality/:filter')
  @OpenAPI({ summary: 'get quality report of air in Sundsvall' })
  async getAirQualityReports(@Param('filter') filter: string): Promise<{ data; message: string }> {
    const currentDate = `${new Date().getFullYear()}-${new Date().getMonth() + 1 > 9 ? new Date().getMonth() + 1 : '0' + (new Date().getMonth() + 1)}-${new Date().getDate() > 9 ? new Date().getDate() : '0' + new Date().getDate()}`;

    const today = new Date();

    const lastYearsDate = `${new Date().getFullYear() - 1}-${new Date().getMonth() + 1 > 9 ? new Date().getMonth() + 1 : '0' + (new Date().getMonth() + 1)}-${new Date().getDate() > 9 ? new Date().getDate() : '0' + new Date().getDate()}`;

    const latestWeekDate = new Date(today);
    latestWeekDate.setDate(today.getDate() - 7);
    const latestWeek = latestWeekDate.toLocaleDateString();
    const latestMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()).toLocaleDateString();
    let filterString;

    switch (filter) {
      case 'day':
        filterString = '';
        break;
      case 'week':
        filterString = `?from=${latestWeek}T07%3A00%3A00Z&to=${today.toLocaleDateString()}T07%3A00%3A00Z`;
        break;
      case 'month':
        filterString = `?from=${latestMonth}T07%3A00%3A00Z&to=${today.toLocaleDateString()}T07%3A00%3A00Z`;
        break;
      case 'year':
        filterString = `?from=${lastYearsDate}T07%3A00%3A00Z&to=${today.toLocaleDateString()}T07%3A00%3A00Z`;
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
