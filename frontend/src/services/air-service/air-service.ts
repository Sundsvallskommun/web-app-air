import { ApiResponse, apiService } from '../api-service';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { __DEV__ } from '@sk-web-gui/react';
import { ServiceResponse } from '@interfaces/services';
import { AirQuality, AirQualityData } from '@interfaces/airquality/airquality';

const getAirQuality: (filter: string) => Promise<ServiceResponse<AirQualityData>> = (filter) => {
  return apiService
    .get<ApiResponse<AirQualityData>>(`/airquality/${filter}`)
    .then((res) => ({ data: res.data.data }))
    .catch((e) => ({
      message: e.response?.data.message,
      error: e.response?.status ?? 'UNKNOWN ERROR',
    }));
};

interface State {
  airQuality: AirQuality;
  airQualityIsLoading: boolean;
  filter: string;
}

interface Actions {
  setAirQuality: (airQuality: AirQuality) => void;
  setFilter: (filter: string) => Promise<ServiceResponse<AirQualityData>>;
  getAirQuality: (filter: string) => Promise<ServiceResponse<AirQualityData>>;
  reset: () => void;
}

const initialState: State = {
  airQuality: {
    dateObserved: {
      type: '',
      value: '',
    },
    id: '',
    location: {
      type: '',
      coordinates: [],
    },
    pollutants: [],
  },
  airQualityIsLoading: false,
  filter: 'week',
};

export const useAirStore = create<State & Actions>()(
  devtools(
    (set, get) => ({
      ...initialState,
      setAirQuality: (airQuality) => set(() => ({ airQuality, airQualityIsLoading: false })),
      setFilter(filter) {
        set(() => ({ filter }));
        set(() => ({ airQualityIsLoading: true }));
        getAirQuality(filter).then((res) => {
          if (!res.error && res.data) {
            set(() => ({ airQuality: res.data?.data, airQualityIsLoading: false }));
          } else {
            set(() => ({ airQualityIsLoading: false }));
          }
        });
      },
      getAirQuality: async (filter) => {
        let airQuality = get().airQuality;
        set(() => ({ airQualityIsLoading: true }));
        const res = await getAirQuality(filter);
        if (!res.error && res.data) {
          airQuality = res.data.data;
          set(() => ({ airQuality: airQuality, airQualityIsLoading: false }));
        } else {
          set(() => ({ airQualityIsLoading: false }));
          return { error: res.error, message: res.message };
        }
        return { data: airQuality };
      },
      reset: () => {
        set(initialState);
      },
    }),
    { enabled: __DEV__ }
  )
);
