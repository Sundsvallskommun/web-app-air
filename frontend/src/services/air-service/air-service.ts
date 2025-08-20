import { ApiResponse, apiService } from '../api-service';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { __DEV__ } from '@sk-web-gui/react';
import { ServiceResponse } from '@interfaces/services';
import { AirQuality, AirQualityData } from '@interfaces/airquality/airquality';

const getAirQuality: () => Promise<ServiceResponse<AirQualityData>> = () => {
  return apiService
    .get<ApiResponse<AirQualityData>>('/airquality')
    .then((res) => ({ data: res.data.data }))
    .catch((e) => ({
      message: e.response?.data.message,
      error: e.response?.status ?? 'UNKNOWN ERROR',
    }));
};

interface State {
  airQuality: AirQuality;
  airQualityIsLoading: boolean;
}

interface Actions {
  setAirQuality: (airQuality: AirQuality) => void;
  getAirQuality: () => Promise<ServiceResponse<AirQualityData>>;
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
};

export const useAirStore = create<State & Actions>()(
  devtools(
    (set, get) => ({
      ...initialState,
      setAirQuality: (airQuality) => set(() => ({ airQuality, airQualityIsLoading: false })),
      getAirQuality: async () => {
        let airQuality = get().airQuality;
        set(() => ({ airQualityIsLoading: true }));
        const res = await getAirQuality();
        if (!res.error && res.data) {
          airQuality = res.data.data;
          set(() => ({ airQuality: airQuality, airQualityIsLoading: false }));
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
