import { useMemo } from 'react';
import { AirQuality, Pollutant } from '@interfaces/airquality/airquality';
import { PollutantType } from '@interfaces/pollutant/pollutant';
import {
  processPollutantData,
  transformToTableData,
  FlatDataItem,
  TableDataItem,
} from '@utils/air-quality-data';
import { ParameterGroup } from '@services/air-service/air-service';

// Pollutants to show for each parameter group
const PM_POLLUTANTS = ['PM10', 'PM25'];
const NO2_POLLUTANTS = ['NO2'];

interface AirQualityDataResult {
  graphData: Pollutant[];
  tableData: TableDataItem[];
  pollutantLabels: string[];
}

/**
 * Custom hook to transform raw air quality data into graph and table formats
 * based on the selected time filter and parameter group
 */
export function useAirQualityData(
  airQuality: AirQuality | null,
  filter: string,
  parameterGroup: ParameterGroup = 'pm'
): AirQualityDataResult {
  return useMemo(() => {
    if (!airQuality?.pollutants?.length) {
      return {
        graphData: [],
        tableData: [],
        pollutantLabels: [],
      };
    }

    // Filter pollutants based on selected parameter group
    const allowedPollutants = parameterGroup === 'pm' ? PM_POLLUTANTS : NO2_POLLUTANTS;

    const graphData: Pollutant[] = [];
    const flatData: FlatDataItem[] = [];
    const pollutantLabels: string[] = [];

    airQuality.pollutants
      .filter((pollutant) => allowedPollutants.includes(pollutant.name))
      .forEach((pollutant) => {
      // Collect pollutant labels
      const label = PollutantType[pollutant.name as keyof typeof PollutantType];
      if (label && !pollutantLabels.includes(label)) {
        pollutantLabels.push(label);
      }

      // Process pollutant data for current filter
      const { graphPollutant, tableData } = processPollutantData(pollutant, filter);

      graphData.push(graphPollutant);
      flatData.push(...tableData);
    });

    // Transform flat data to table format
    const tableData = transformToTableData(flatData);

    return {
      graphData,
      tableData,
      pollutantLabels,
    };
  }, [airQuality, filter, parameterGroup]);
}
