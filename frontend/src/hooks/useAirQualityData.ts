import { useMemo } from 'react';
import { AirQuality, Pollutant } from '@interfaces/airquality/airquality';
import { PollutantType } from '@interfaces/pollutant/pollutant';
import {
  processPollutantData,
  transformToTableData,
  FlatDataItem,
  TableDataItem,
} from '@utils/air-quality-data';

interface AirQualityDataResult {
  graphData: Pollutant[];
  tableData: TableDataItem[];
  pollutantLabels: string[];
}

/**
 * Custom hook to transform raw air quality data into graph and table formats
 * based on the selected time filter
 */
export function useAirQualityData(
  airQuality: AirQuality | null,
  filter: string
): AirQualityDataResult {
  return useMemo(() => {
    if (!airQuality?.pollutants?.length) {
      return {
        graphData: [],
        tableData: [],
        pollutantLabels: [],
      };
    }

    const graphData: Pollutant[] = [];
    const flatData: FlatDataItem[] = [];
    const pollutantLabels: string[] = [];

    airQuality.pollutants.forEach((pollutant) => {
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
  }, [airQuality, filter]); // Fixed: filter is now included in dependencies
}
