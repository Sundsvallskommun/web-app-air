import { useEffect, useState } from 'react';
import { AutoTable } from '@sk-web-gui/react';

interface AirQualityTableProps {
  tableData: {
    [key: string]: number | string;
  }[];
  pollutantLabels: string[];
}

export const AirQualityTable: React.FC<AirQualityTableProps> = ({ tableData, pollutantLabels }) => {
  console.log('table', tableData);

  const PollutansLabels = pollutantLabels.map((p) => {
    return { label: p, property: p };
  });

  const headerLabels = [{ label: 'Observerad vid', property: 'observedAt' }, ...PollutansLabels];

  return (
    tableData && (
      <AutoTable className="mt-24" pageSize={14} autodata={tableData} dense autoheaders={headerLabels} background />
    )
  );
};
