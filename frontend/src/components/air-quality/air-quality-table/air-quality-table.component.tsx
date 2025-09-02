import { AutoTable } from '@sk-web-gui/react';

interface AirQualityTableProps {
  tableData: {
    [key: string]: number | string;
  }[];
  pollutantLabels: string[];
}

export const AirQualityTable: React.FC<AirQualityTableProps> = ({ tableData, pollutantLabels }) => {
  const PollutansLabels = pollutantLabels.map((p) => {
    return {
      label: p,
      property: p,
      isColumnSortable: false,
      renderColumn: (value: string) => <span>{value}</span>,
    };
  });

  const headerLabels = [
    {
      label: 'Observerad vid',
      property: 'observedAt',
      isColumnSortable: false,
      sticky: true,
      renderColumn: (value: string) => <span className="font-semibold">{value}</span>,
    },
    ...PollutansLabels,
  ];

  return (
    tableData && (
      <AutoTable
        className="mt-24"
        pageSize={15}
        pageSizeEdit="select"
        pageSizeOptions={[5, 10, 15, 25, 50, 75, 100]}
        autodata={tableData}
        dense
        autoheaders={headerLabels}
        background
      />
    )
  );
};
