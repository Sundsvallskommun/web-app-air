import { Pollutant } from '@interfaces/airquality/airquality';
import { PollutantColor, PollutantType } from '@interfaces/pollutant/pollutant';
import { formatValue } from '@utils/format-value';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip } from 'recharts';

interface AirQualityGraphProps {
  graphData: Pollutant[];
}

const HIDDEN_IN_GRAPH = ['AtmosphericPressure', 'RelativeHumidity'];

export const AirQualityGraph: React.FC<AirQualityGraphProps> = ({ graphData }) => {
  const filteredData = graphData.filter((pollutant) => !HIDDEN_IN_GRAPH.includes(pollutant.name));

  const allValues = filteredData.flatMap((pollutant) => pollutant.values.map((v) => v.value));
  const minValue = allValues.length > 0 ? Math.min(...allValues) : 0;
  const maxValue = allValues.length > 0 ? Math.max(...allValues) : 100;
  const padding = (maxValue - minValue) * 0.1 || 10;
  const domain: [number, number] = [Math.floor(minValue - padding), Math.ceil(maxValue + padding)];

  return (
    <div style={{ width: '100%', height: '80vh' }}>
      <ResponsiveContainer width="100%" height="100%" className="mb-56 mt-24">
        <LineChart
          height={800}
          data={graphData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="observedAt" allowDuplicatedCategory={false} />
          <YAxis dataKey="value" domain={domain} tickFormatter={(value: number) => formatValue(value)} />
          <Tooltip formatter={(value: number) => formatValue(value)} />
          <Legend height={100} />
          {filteredData.map((pollutant) => {
            return (
              <Line
                dataKey="value"
                stroke={PollutantColor[pollutant.name as keyof typeof PollutantColor]}
                data={pollutant.values}
                name={PollutantType[pollutant.name as keyof typeof PollutantType]}
                key={pollutant.name}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
