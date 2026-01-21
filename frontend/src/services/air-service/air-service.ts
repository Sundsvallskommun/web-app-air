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
  airQualityError: string | null;
  filter: string;
}

interface Actions {
  setAirQuality: (airQuality: AirQuality) => void;
  setFilter: (filter: string) => Promise<ServiceResponse<AirQualityData>>;
  getAirQuality: (filter: string) => Promise<ServiceResponse<AirQualityData>>;
  reset: () => void;
}

const getErrorMessage = (error: string | number | boolean | undefined): string => {
  switch (error) {
    case 504:
      return 'Servern svarar inte. Försök igen senare.';
    case 502:
      return 'Kunde inte ansluta till servern. Försök igen senare.';
    case 500:
      return 'Ett serverfel uppstod. Försök igen senare.';
    case 404:
      return 'Data kunde inte hittas.';
    default:
      return 'Ett fel uppstod vid hämtning av data. Försök igen senare.';
  }
};

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
  airQualityError: null,
  filter: 'week',
};

export const useAirStore = create<State & Actions>()(
  devtools(
    (set, get) => ({
      ...initialState,
      setAirQuality: (airQuality) => set(() => ({ airQuality, airQualityIsLoading: false, airQualityError: null })),
      setFilter(filter) {
        set(() => ({ filter, airQualityError: null }));
        set(() => ({ airQualityIsLoading: true }));
        getAirQuality(filter).then((res) => {
          if (!res.error && res.data) {
            set(() => ({ airQuality: res.data?.data, airQualityIsLoading: false, airQualityError: null }));
          } else {
            set(() => ({ airQualityIsLoading: false, airQualityError: getErrorMessage(res.error) }));
          }
        });
      },
      getAirQuality: async (filter) => {
        let airQuality = get().airQuality;
        set(() => ({ airQualityIsLoading: true, airQualityError: null }));
        const res = await getAirQuality(filter);
        if (!res.error && res.data) {
          airQuality = res.data.data;
          set(() => ({ airQuality: airQuality, airQualityIsLoading: false, airQualityError: null }));
        } else {
          const errorMessage = getErrorMessage(res.error);
          set(() => ({ airQualityIsLoading: false, airQualityError: errorMessage }));
          return { error: res.error, message: errorMessage };
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
