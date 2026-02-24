import { useAirStore } from '@services/air-service/air-service';
import { AutoTable } from '@sk-web-gui/react';
import { formatDisplayDate, nameToKey } from '@utils/air-quality-data';
import { formatValue } from '@utils/format-value';

interface AirQualityTableProps {
  tableData: {
    [key: string]: number | string;
  }[];
  pollutantLabels: string[];
}

export const AirQualityTable: React.FC<AirQualityTableProps> = ({ tableData, pollutantLabels }) => {
  const filter = useAirStore((s) => s.filter);
  const pollutantColumns = pollutantLabels.map((p) => {
    return {
      label: p,
      property: nameToKey(p),
      isColumnSortable: false,
      renderColumn: (value: number | string) => <span>{formatValue(value)}</span>,
    };
  });

  const headerLabels = [
    {
      label: 'Observerad vid',
      property: 'observedAt',
      isColumnSortable: false,
      sticky: true,
      renderColumn: (value: string) => {
        return <span className="font-semibold">{formatDisplayDate(value, filter)}</span>;
      },
    },
    ...pollutantColumns,
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
