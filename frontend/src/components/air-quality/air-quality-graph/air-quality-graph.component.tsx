import { Pollutant } from '@interfaces/airquality/airquality';
import { PollutantColor, PollutantType } from '@interfaces/pollutant/pollutant';
import { formatValue } from '@utils/format-value';
import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export type ChartType = 'line' | 'bar';

interface AirQualityGraphProps {
  graphData: Pollutant[];
  chartType?: ChartType;
}

const HIDDEN_IN_GRAPH = ['AtmosphericPressure', 'RelativeHumidity', 'Temperature'];

export const AirQualityGraph: React.FC<AirQualityGraphProps> = ({ graphData, chartType = 'line' }) => {
  const filteredData = graphData.filter((pollutant) => !HIDDEN_IN_GRAPH.includes(pollutant.name));

  const allValues = filteredData.flatMap((pollutant) => pollutant.values.map((v) => v.value));
  const minValue = allValues.length > 0 ? Math.min(...allValues) : 0;
  const maxValue = allValues.length > 0 ? Math.max(...allValues) : 100;
  const padding = (maxValue - minValue) * 0.1 || 10;
  const domain: [number, number] = [Math.floor(minValue - padding), Math.ceil(maxValue + padding)];

  const barChartData = useMemo(() => {
    if (chartType !== 'bar' || filteredData.length === 0) return [];

    const dataByDate: Record<string, Record<string, number | string>> = {};

    filteredData.forEach((pollutant) => {
      const pollutantKey = PollutantType[pollutant.name as keyof typeof PollutantType];
      pollutant.values.forEach((v) => {
        if (!dataByDate[v.observedAt]) {
          dataByDate[v.observedAt] = { observedAt: v.observedAt };
        }
        dataByDate[v.observedAt][pollutantKey] = v.value;
      });
    });

    return Object.values(dataByDate);
  }, [filteredData, chartType]);

  const chartMargin = {
    top: 20,
    right: 30,
    left: 20,
    bottom: 10,
  };

  return (
    <div className="flex justify-center">
      <div style={{ width: '75%', height: '60vh' }}>
        <ResponsiveContainer width="100%" height="100%" className="mb-56 mt-24">
          {chartType === 'bar' ?
            <BarChart height={800} data={barChartData} margin={chartMargin}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="observedAt" />
              <YAxis domain={domain} tickFormatter={(value: number) => formatValue(value)} />
              <Tooltip formatter={(value: number) => formatValue(value)} />
              <Legend height={100} />
              {filteredData.map((pollutant) => (
                <Bar
                  dataKey={PollutantType[pollutant.name as keyof typeof PollutantType]}
                  fill={PollutantColor[pollutant.name as keyof typeof PollutantColor]}
                  key={pollutant.name}
                />
              ))}
            </BarChart>
          : <LineChart height={800} data={graphData} margin={chartMargin}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="observedAt" allowDuplicatedCategory={false} />
              <YAxis dataKey="value" domain={domain} tickFormatter={(value: number) => formatValue(value)} />
              <Tooltip formatter={(value: number) => formatValue(value)} />
              <Legend height={100} />
              {filteredData.map((pollutant) => (
                <Line
                  dataKey="value"
                  stroke={PollutantColor[pollutant.name as keyof typeof PollutantColor]}
                  data={pollutant.values}
                  name={PollutantType[pollutant.name as keyof typeof PollutantType]}
                  key={pollutant.name}
                />
              ))}
            </LineChart>
          }
        </ResponsiveContainer>
      </div>
    </div>
  );
};
