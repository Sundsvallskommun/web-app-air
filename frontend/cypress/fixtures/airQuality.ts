import { AirQualityData } from '../../src/interfaces/airquality/airquality';

// Mock data with pollutants for successful response
export const airQualityWithData: { data: AirQualityData; message: string } = {
  data: {
    data: {
      id: 'urn:ngsi-ld:AirQualityObserved:888100',
      location: {
        type: 'Point',
        coordinates: [17.308968, 62.388618],
      },
      dateObserved: {
        type: 'DateTime',
        value: '2026-01-20T12:00:00Z',
      },
      pollutants: [
        {
          name: 'PM10',
          values: [
            { value: 12.5, observedAt: '2026-01-14T08:00:00Z' },
            { value: 15.2, observedAt: '2026-01-15T08:00:00Z' },
            { value: 11.8, observedAt: '2026-01-16T08:00:00Z' },
            { value: 14.1, observedAt: '2026-01-17T08:00:00Z' },
            { value: 13.3, observedAt: '2026-01-18T08:00:00Z' },
            { value: 10.9, observedAt: '2026-01-19T08:00:00Z' },
            { value: 12.0, observedAt: '2026-01-20T08:00:00Z' },
          ],
        },
        {
          name: 'PM25',
          values: [
            { value: 8.2, observedAt: '2026-01-14T08:00:00Z' },
            { value: 9.5, observedAt: '2026-01-15T08:00:00Z' },
            { value: 7.8, observedAt: '2026-01-16T08:00:00Z' },
            { value: 8.9, observedAt: '2026-01-17T08:00:00Z' },
            { value: 8.1, observedAt: '2026-01-18T08:00:00Z' },
            { value: 6.5, observedAt: '2026-01-19T08:00:00Z' },
            { value: 7.2, observedAt: '2026-01-20T08:00:00Z' },
          ],
        },
        {
          name: 'NO2',
          values: [
            { value: 22.1, observedAt: '2026-01-14T08:00:00Z' },
            { value: 25.4, observedAt: '2026-01-15T08:00:00Z' },
            { value: 19.8, observedAt: '2026-01-16T08:00:00Z' },
            { value: 23.2, observedAt: '2026-01-17T08:00:00Z' },
            { value: 21.5, observedAt: '2026-01-18T08:00:00Z' },
            { value: 18.3, observedAt: '2026-01-19T08:00:00Z' },
            { value: 20.1, observedAt: '2026-01-20T08:00:00Z' },
          ],
        },
        {
          name: 'temperature',
          values: [
            { value: -2.5, observedAt: '2026-01-14T08:00:00Z' },
            { value: -1.8, observedAt: '2026-01-15T08:00:00Z' },
            { value: 0.5, observedAt: '2026-01-16T08:00:00Z' },
            { value: 1.2, observedAt: '2026-01-17T08:00:00Z' },
            { value: -0.3, observedAt: '2026-01-18T08:00:00Z' },
            { value: -3.1, observedAt: '2026-01-19T08:00:00Z' },
            { value: -1.5, observedAt: '2026-01-20T08:00:00Z' },
          ],
        },
      ],
    },
  },
  message: 'success',
};

// Mock data with empty pollutants array
export const airQualityEmpty: { data: AirQualityData; message: string } = {
  data: {
    data: {
      id: 'urn:ngsi-ld:AirQualityObserved:888100',
      location: {
        type: 'Point',
        coordinates: [17.308968, 62.388618],
      },
      dateObserved: {
        type: 'DateTime',
        value: '2026-01-20T12:00:00Z',
      },
      pollutants: [],
    },
  },
  message: 'success',
};

// Mock data for day filter (hourly data)
export const airQualityDay: { data: AirQualityData; message: string } = {
  data: {
    data: {
      id: 'urn:ngsi-ld:AirQualityObserved:888100',
      location: {
        type: 'Point',
        coordinates: [17.308968, 62.388618],
      },
      dateObserved: {
        type: 'DateTime',
        value: '2026-01-20T12:00:00Z',
      },
      pollutants: [
        {
          name: 'PM10',
          values: [
            { value: 10.5, observedAt: '2026-01-20T00:00:00Z' },
            { value: 11.2, observedAt: '2026-01-20T01:00:00Z' },
            { value: 12.8, observedAt: '2026-01-20T02:00:00Z' },
            { value: 14.1, observedAt: '2026-01-20T03:00:00Z' },
            { value: 15.3, observedAt: '2026-01-20T04:00:00Z' },
            { value: 16.9, observedAt: '2026-01-20T05:00:00Z' },
            { value: 18.2, observedAt: '2026-01-20T06:00:00Z' },
            { value: 20.0, observedAt: '2026-01-20T07:00:00Z' },
            { value: 22.5, observedAt: '2026-01-20T08:00:00Z' },
            { value: 19.8, observedAt: '2026-01-20T09:00:00Z' },
            { value: 15.4, observedAt: '2026-01-20T10:00:00Z' },
            { value: 12.1, observedAt: '2026-01-20T11:00:00Z' },
          ],
        },
        {
          name: 'NO2',
          values: [
            { value: 18.5, observedAt: '2026-01-20T00:00:00Z' },
            { value: 19.2, observedAt: '2026-01-20T01:00:00Z' },
            { value: 20.8, observedAt: '2026-01-20T02:00:00Z' },
            { value: 22.1, observedAt: '2026-01-20T03:00:00Z' },
            { value: 24.3, observedAt: '2026-01-20T04:00:00Z' },
            { value: 28.9, observedAt: '2026-01-20T05:00:00Z' },
            { value: 35.2, observedAt: '2026-01-20T06:00:00Z' },
            { value: 42.0, observedAt: '2026-01-20T07:00:00Z' },
            { value: 38.5, observedAt: '2026-01-20T08:00:00Z' },
            { value: 30.8, observedAt: '2026-01-20T09:00:00Z' },
            { value: 25.4, observedAt: '2026-01-20T10:00:00Z' },
            { value: 21.1, observedAt: '2026-01-20T11:00:00Z' },
          ],
        },
      ],
    },
  },
  message: 'success',
};
