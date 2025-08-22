import { useEffect, useState } from 'react';
import { IAirQualityTable } from '../air-quality.component';
import { AutoTable } from '@sk-web-gui/react';
import { PollutantType } from '@interfaces/pollutant/pollutant';

interface AirQualityTableProps {
  tableData: IAirQualityTable[];
}

export const AirQualityTable: React.FC<AirQualityTableProps> = ({ tableData }) => {
  const [data, setData] = useState<IAirQualityTable[]>();
  useEffect(() => {
    const dataArray: IAirQualityTable[] = [];
    if (tableData && tableData.length > 0) {
      tableData.forEach((item) => {
        dataArray.push({
          name: PollutantType[item.name as keyof typeof PollutantType],
          value: item.value,
          observedAt: item.observedAt,
        });
      });
      setData(dataArray);
    }
  }, [tableData]);
  const headerLabels = [
    { label: 'Observerad vid', property: 'observedAt' },
    { label: 'Förorenande ämne', property: 'name' },
    { label: 'Värde', property: 'value' },
  ];

  return data && <AutoTable pageSize={14} autodata={data} dense autoheaders={headerLabels} background />;
};
