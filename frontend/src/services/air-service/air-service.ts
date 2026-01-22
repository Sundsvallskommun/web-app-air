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
  cache: Record<string, AirQuality>;
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
  filter: 'fourdays',
  cache: {},
};

export const useAirStore = create<State & Actions>()(
  devtools(
    (set, get) => ({
      ...initialState,
      setAirQuality: (airQuality) => set(() => ({ airQuality, airQualityIsLoading: false, airQualityError: null })),
      setFilter(filter) {
        const cachedData = get().cache[filter];
        set(() => ({ filter, airQualityError: null }));

        if (cachedData) {
          set(() => ({ airQuality: cachedData }));
          return Promise.resolve({ data: cachedData });
        }

        set(() => ({ airQualityIsLoading: true }));
        return getAirQuality(filter).then((res) => {
          if (!res.error && res.data) {
            const data = res.data.data;
            set((state) => ({
              airQuality: data,
              airQualityIsLoading: false,
              airQualityError: null,
              cache: { ...state.cache, [filter]: data },
            }));
          } else {
            set(() => ({ airQualityIsLoading: false, airQualityError: getErrorMessage(res.error) }));
          }
          return res;
        });
      },
      getAirQuality: async (filter) => {
        const cachedData = get().cache[filter];
        if (cachedData) {
          set(() => ({ airQuality: cachedData, airQualityError: null }));
          return { data: cachedData };
        }

        set(() => ({ airQualityIsLoading: true, airQualityError: null }));
        const res = await getAirQuality(filter);
        if (!res.error && res.data) {
          const data = res.data.data;
          set((state) => ({
            airQuality: data,
            airQualityIsLoading: false,
            airQualityError: null,
            cache: { ...state.cache, [filter]: data },
          }));
          return { data };
        } else {
          const errorMessage = getErrorMessage(res.error);
          set(() => ({ airQualityIsLoading: false, airQualityError: errorMessage }));
          return { error: res.error, message: errorMessage };
        }
      },
      reset: () => {
        set(initialState);
      },
    }),
    { enabled: __DEV__ }
  )
);
