import { ApiResponse, apiService } from '../api-service';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { __DEV__ } from '@sk-web-gui/react';
import { ServiceResponse } from '@interfaces/services';

const getAirQuality: () => Promise<ServiceResponse<object>> = () => {
  return apiService
    .get<ApiResponse<object>>('/airquality')
    .then((res) => ({ data: res.data.data }))
    .catch((e) => ({
      message: e.response?.data.message,
      error: e.response?.status ?? 'UNKNOWN ERROR',
    }));
};

interface State {
  airQuality: object;
}

interface Actions {
  setAirQuality: (airQuality: object) => void;
  getAirQuality: () => Promise<ServiceResponse<object>>;
  reset: () => void;
}

const initialState: State = {
  airQuality: [],
};

export const useAirStore = create<State & Actions>()(
  devtools(
    (set, get) => ({
      ...initialState,
      setAirQuality: (airQuality) => set(() => airQuality),
      getAirQuality: async () => {
        let airQuality = get().airQuality;
        const res = await getAirQuality();
        if (!res.error && res.data) {
          airQuality = res.data;
          set(() => ({ airQuality: airQuality }));
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
