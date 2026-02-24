import { ApiResponse, apiService } from '../api-service';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { __DEV__ } from '@sk-web-gui/react';
import { ServiceResponse } from '@interfaces/services';
import { AirQuality, AirQualityData } from '@interfaces/airquality/airquality';

const getAirQuality: (filter: string, station: string) => Promise<ServiceResponse<AirQualityData>> = (filter, station) => {
  return apiService
    .get<ApiResponse<AirQualityData>>(`/airquality/${filter}?station=${station}`)
    .then((res) => ({ data: res.data.data }))
    .catch((e) => ({
      message: e.response?.data.message,
      error: e.response?.status ?? 'UNKNOWN ERROR',
    }));
};

export type ParameterGroup = 'pm' | 'no2';

interface State {
  airQuality: AirQuality;
  airQualityIsLoading: boolean;
  airQualityError: string | null;
  filter: string;
  station: string;
  parameterGroup: ParameterGroup;
  cache: Record<string, AirQuality>;
}

interface Actions {
  setAirQuality: (airQuality: AirQuality) => void;
  setFilter: (filter: string) => Promise<ServiceResponse<AirQualityData>>;
  setStation: (station: string) => Promise<ServiceResponse<AirQualityData>>;
  setParameterGroup: (parameterGroup: ParameterGroup) => void;
  getAirQuality: (filter: string, station?: string) => Promise<ServiceResponse<AirQualityData>>;
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

async function fetchOrCache(
  filter: string,
  station: string,
  get: () => State & Actions,
  set: (partial: Partial<State> | ((state: State & Actions) => Partial<State>)) => void
) {
  const cacheKey = `${station}:${filter}`;
  const cachedData = get().cache[cacheKey];

  if (cachedData) {
    set({ airQuality: cachedData, airQualityError: null });
    return { data: cachedData };
  }

  set({ airQualityIsLoading: true, airQualityError: null });
  const res = await getAirQuality(filter, station);

  if (!res.error && res.data) {
    const data = res.data.data;
    set((state) => ({
      airQuality: data,
      airQualityIsLoading: false,
      airQualityError: null,
      cache: { ...state.cache, [cacheKey]: data },
    }));
    return { data };
  }

  const errorMessage = getErrorMessage(res.error);
  set({ airQualityIsLoading: false, airQualityError: errorMessage });
  return { error: res.error, message: errorMessage };
}

// Station IDs
export const STATION_KOPMANGATAN = '888100';
export const STATION_BERGSGATAN = '1098100';

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
  station: STATION_KOPMANGATAN,
  parameterGroup: 'pm',
  cache: {},
};

export const useAirStore = create<State & Actions>()(
  devtools(
    (set, get) => ({
      ...initialState,
      setAirQuality: (airQuality) => set(() => ({ airQuality, airQualityIsLoading: false, airQualityError: null })),
      setFilter: (filter) => {
        set(() => ({ filter }));
        return fetchOrCache(filter, get().station, get, set);
      },
      setStation: (station) => {
        // Reset to PM when switching to Bergsgatan (NO2 not available there)
        const parameterGroup = station === STATION_BERGSGATAN ? 'pm' : get().parameterGroup;
        set(() => ({ station, parameterGroup }));
        return fetchOrCache(get().filter, station, get, set);
      },
      setParameterGroup: (parameterGroup) => {
        set(() => ({ parameterGroup }));
      },
      getAirQuality: (filter, stationOverride) => {
        const station = stationOverride ?? get().station;
        return fetchOrCache(filter, station, get, set);
      },
      reset: () => {
        set(initialState);
      },
    }),
    { enabled: __DEV__ }
  )
);
