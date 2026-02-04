import ApiService from '@/services/api.service';
import { logger } from '@/utils/logger';
import dayjs from 'dayjs';
import { Controller, Get, Param, QueryParam } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

const DATE_FORMAT = 'YYYY-MM-DD';
const TIME_SUFFIX = 'T07%3A00%3A00Z';

// Set to true to use mock data instead of real API
const USE_MOCK_DATA = false; //process.env.NODE_ENV === 'development';

const STATION_URNS: Record<string, string> = {
  '888100': 'urn:ngsi-ld:AirQualityObserved:888100', // Köpmangatan
  '1098100': 'urn:ngsi-ld:AirQualityObserved:1098100', // Bergsgatan
};
const DEFAULT_STATION = '888100';

// Station-specific allowed pollutants
// Köpmangatan: PM10, PM2.5, NO2
// Bergsgatan: PM10, PM2.5
const STATION_ALLOWED_POLLUTANTS: Record<string, string[]> = {
  '888100': ['PM25', 'PM10', 'NO2'], // Köpmangatan
  '1098100': ['PM25', 'PM10'], // Bergsgatan
};

// Mock data configurations (baseValue and variance for generating test data)
const POLLUTANT_MOCK_CONFIGS: Record<string, { baseValue: number; variance: number }> = {
  PM25: { baseValue: 10, variance: 5 },
  PM10: { baseValue: 20, variance: 10 },
  NO2: { baseValue: 25, variance: 12 },
};

function generateMockAirQuality(filter: string, station: string) {
  const now = dayjs();
  const hoursMap: Record<string, number> = {
    day: 24,
    fourdays: 96,
    week: 168,
    month: 720,
    year: 8760,
  };
  const hours = hoursMap[filter] || 24;

  const timestamps: string[] = [];
  for (let i = hours - 1; i >= 0; i--) {
    timestamps.push(now.subtract(i, 'hour').toISOString());
  }

  const allowedPollutants = STATION_ALLOWED_POLLUTANTS[station] || STATION_ALLOWED_POLLUTANTS[DEFAULT_STATION];

  const pollutants = allowedPollutants.map(name => {
    const config = POLLUTANT_MOCK_CONFIGS[name];
    return {
      name,
      values: timestamps.map(timestamp => ({
        value: Math.max(0, Math.round((config.baseValue + (Math.random() - 0.5) * 2 * config.variance) * 100) / 100),
        observedAt: timestamp,
      })),
    };
  });

  return {
    data: {
      dateObserved: {
        type: 'Property',
        value: now.toISOString(),
      },
      id: STATION_URNS[station] || STATION_URNS[DEFAULT_STATION],
      location: {
        type: 'Point',
        coordinates: [17.3069, 62.3908],
      },
      pollutants,
    },
  };
}

function filterPollutantsByStation(data: any, station: string) {
  const allowedPollutants = STATION_ALLOWED_POLLUTANTS[station] || STATION_ALLOWED_POLLUTANTS[DEFAULT_STATION];

  if (data?.data?.pollutants) {
    data.data.pollutants = data.data.pollutants.filter((p: { name: string }) => allowedPollutants.includes(p.name));
  }

  return data;
}

@Controller()
export class AirController {
  private apiService = new ApiService();

  @Get('/airquality/:filter')
  @OpenAPI({ summary: 'get quality report of air in Sundsvall' })
  async getAirQualityReports(
    @Param('filter') filter: string,
    @QueryParam('station') stationParam?: string
  ): Promise<{ data; message: string }> {
    // Validate station parameter, default to DEFAULT_STATION if invalid
    const station = stationParam && STATION_URNS[stationParam] ? stationParam : DEFAULT_STATION;

    if (USE_MOCK_DATA) {
      logger.info(`Using mock data for filter: ${filter}, station: ${station}`);
      return { data: generateMockAirQuality(filter, station), message: 'success' };
    }

    const today = dayjs();
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
        filterString = `?from=${today.subtract(4, 'day').startOf('day').toISOString()}&to=${today.startOf('day').toISOString()}`;
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

    const encodedUrn = encodeURIComponent(STATION_URNS[station]);
    const url = `/opendata/1.0/airqualities/${encodedUrn}${filterString}`;
    const res = await this.apiService.get({ url }).catch(e => {
      logger.error('Error when fetching air quality');
      throw e;
    });

    const filteredData = filterPollutantsByStation(res.data, station);
    return { data: filteredData, message: 'success' };
  }
}
