export interface AirQualityData {
  data: AirQuality;
}

export interface AirQuality {
  dateObserved: {
    type: string;
    value: string;
  };
  id: string;
  location: {
    type: string;
    coordinates: number[];
  };
  pollutants: Pollutant[];
}
export interface Pollutant {
  name: string;
  values: Value[];
}

export interface Value {
  value: number;
  observedAt: string;
}
