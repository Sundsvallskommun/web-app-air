import { Pollutant } from '@interfaces/airquality/airquality';
import { PollutantColor, PollutantType } from '@interfaces/pollutant/pollutant';
import { formatValue } from '@utils/format-value';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip } from 'recharts';

interface AirQualityGraphProps {
  graphData: Pollutant[];
}

export const AirQualityGraph: React.FC<AirQualityGraphProps> = ({ graphData }) => {
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
          <YAxis dataKey="value" domain={[-150, 1500]} tickFormatter={(value: number) => formatValue(value)} />
          <Tooltip formatter={(value: number) => formatValue(value)} />
          <Legend height={100} />
          {graphData.map((pollutant) => {
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
