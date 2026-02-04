export enum Pollutant {
  AtmosphericPressure = 'AtmosphericPressure',
  Temperature = 'Temperature',
  RelativeHumidity = 'RelativeHumidity',
  PM1 = 'PM1',
  PM4 = 'PM4',
  PM10 = 'PM10',
  PM25 = 'PM25',
  TotalSuspendedParticulate = 'TotalSuspendedParticulate',
  NO = 'NO',
  NO2 = 'NO2',
  NOx = 'NOx',
}
export const PollutantType = {
  AtmosphericPressure: 'Lufttryck (hPa)',
  Temperature: 'Temperatur (°C)',
  RelativeHumidity: 'Relativ Luftfuktighet (%)',
  PM1: 'PM1 (µg/m³)',
  PM4: 'PM4 (µg/m³)',
  PM10: 'PM10 (µg/m³)',
  PM25: 'PM2.5 (µg/m³)',
  TotalSuspendedParticulate: 'TSP (µg/m³)',
  NO: 'NO (µg/m³)',
  NO2: 'NO2 (µg/m³)',
  NOx: 'NOx (µg/m³)',
};

// Colors based on Wong palette for color-blind accessibility
export const PollutantColor = {
  AtmosphericPressure: '#CC79A7', // reddish purple
  Temperature: '#009E73', // bluish green
  RelativeHumidity: '#56B4E9', // sky blue
  PM1: '#E69F00', // orange
  PM4: '#F0E442', // yellow
  PM10: '#0072B2', // blue
  PM25: '#D55E00', // vermillion/orange-red
  TotalSuspendedParticulate: '#CC79A7', // reddish purple
  NO: '#F0E442', // yellow
  NO2: '#009E73', // bluish green
  NOx: '#56B4E9', // sky blue
};
