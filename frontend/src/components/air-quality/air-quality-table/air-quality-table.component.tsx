import { useAirStore } from '@services/air-service/air-service';
import { AutoTable } from '@sk-web-gui/react';
import dayjs from 'dayjs';

interface AirQualityTableProps {
  tableData: {
    [key: string]: number | string;
  }[];
  pollutantLabels: string[];
}

export const AirQualityTable: React.FC<AirQualityTableProps> = ({ tableData, pollutantLabels }) => {
  const weekDays = ['Mån', 'Tis', 'Ons', 'Tors', 'Fre', 'Lör', 'Sön'];
  const filter = useAirStore((s) => s.filter);
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
      renderColumn: (value: string) =>
        filter === 'week' ?
          <span className="font-semibold">{`${dayjs(new Date(value)).format('DD MMM')} (${weekDays[dayjs(new Date(value)).day() === 0 ? 6 : dayjs(new Date(value)).day() - 1]})`}</span>
        : <span className="font-semibold">
            {filter === 'month' ? `${dayjs(new Date(value)).format('DD MMM')}` : value}
          </span>,
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
