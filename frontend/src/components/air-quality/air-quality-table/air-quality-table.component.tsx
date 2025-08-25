import { useEffect, useState } from 'react';
import { AutoTable } from '@sk-web-gui/react';

interface AirQualityTableProps {
  tableData: {
    value: number;
    observedAt: string;
    name: string;
  }[];
}

export const AirQualityTable: React.FC<AirQualityTableProps> = ({ tableData }) => {
  const [data, setData] = useState<
    {
      observedAt: string;
      value: string;
    }[]
  >();

  console.log('table', tableData);

  useEffect(() => {
    const dataArray: {
      observedAt: string;
      value: string;
    }[] = [];
    if (tableData) {
      tableData.forEach((t) => {
        dataArray.push({
          observedAt: t.observedAt,
          value: `${t.name} ${t.value}`,
        });
      });
    }
    setData(dataArray);
  }, [tableData]);

  const headerLabels = [
    {
      label: 'Observerat vid',
      property: 'observedAt',
      isColumnSortable: false,
    },
    {
      label: 'Mätvärde',
      property: 'value',
    },
  ];

  return (
    data && <AutoTable className="mt-24" pageSize={14} autodata={data} dense autoheaders={headerLabels} background />
  );
};
