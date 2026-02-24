import { Pollutant } from '@interfaces/airquality/airquality';
import { PollutantColor, PollutantType } from '@interfaces/pollutant/pollutant';
import { ParameterGroup } from '@services/air-service/air-service';
import { formatAxisLabel, formatTooltipLabel } from '@utils/air-quality-data';
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
  ReferenceLine,
} from 'recharts';

export type ChartType = 'line' | 'bar';

interface AirQualityGraphProps {
  graphData: Pollutant[];
  chartType?: ChartType;
  filter: string;
  parameterGroup: ParameterGroup;
}

const HIDDEN_IN_GRAPH = ['AtmosphericPressure', 'RelativeHumidity', 'Temperature'];

// Norm line colors
const PM_NORM_COLOR = '#666';
const NO2_NORM_COLOR = '#009E73'; // Bluish green (matches NO2 pollutant color)

export const AirQualityGraph: React.FC<AirQualityGraphProps> = ({
  graphData,
  chartType = 'line',
  filter,
  parameterGroup,
}) => {
  const filteredData = graphData.filter((pollutant) => !HIDDEN_IN_GRAPH.includes(pollutant.name));

  // Determine which norm lines to show based on filter and parameter group
  const showPmNormLines = parameterGroup === 'pm' && filter === 'fourdays';
  const showNo2DailyNorm = parameterGroup === 'no2' && filter === 'fourdays';
  const showNo2HourlyNorm = parameterGroup === 'no2' && filter === 'day';

  const allValues = filteredData.flatMap((pollutant) => pollutant.values.map((v) => v.value));
  const minValue = allValues.length > 0 ? Math.min(...allValues) : 0;
  const maxValue = allValues.length > 0 ? Math.max(...allValues) : 100;
  const padding = (maxValue - minValue) * 0.1 || 10;

  // Ensure domain includes norm lines when visible
  let minDomainMax = 55; // Default for PM
  if (showNo2DailyNorm) minDomainMax = 65; // Ensure 60 µg/m³ line is visible
  if (showNo2HourlyNorm) minDomainMax = 95; // Ensure 90 µg/m³ line is visible

  const domainMax = Math.max(Math.ceil(maxValue + padding), minDomainMax);
  const domain: [number, number] = [0, domainMax];

  const chartData = useMemo(() => {
    if (filteredData.length === 0) return [];

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
  }, [filteredData]);

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
            <BarChart height={800} data={chartData} margin={chartMargin}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="observedAt" interval={0} tickFormatter={formatAxisLabel} />
              <YAxis domain={domain} tickFormatter={(value: number) => formatValue(value)} />
              <Tooltip formatter={(value: number) => formatValue(value)} labelFormatter={formatTooltipLabel} />
              <Legend height={100} />
              {filteredData.map((pollutant) => (
                <Bar
                  dataKey={PollutantType[pollutant.name as keyof typeof PollutantType]}
                  fill={PollutantColor[pollutant.name as keyof typeof PollutantColor]}
                  key={pollutant.name}
                />
              ))}
              {showPmNormLines && (
                <>
                  <ReferenceLine
                    y={30}
                    stroke={PM_NORM_COLOR}
                    strokeDasharray="5 5"
                    label={{ value: 'PM Miljömål (30 µg/m³)', position: 'insideTopLeft', fill: PM_NORM_COLOR, fontSize: 12 }}
                  />
                  <ReferenceLine
                    y={50}
                    stroke={PM_NORM_COLOR}
                    strokeDasharray="5 5"
                    label={{
                      value: 'PM Gränsvärde (50 µg/m³)',
                      position: 'insideTopLeft',
                      fill: PM_NORM_COLOR,
                      fontSize: 12,
                    }}
                  />
                </>
              )}
              {showNo2DailyNorm && (
                <ReferenceLine
                  y={60}
                  stroke={NO2_NORM_COLOR}
                  strokeDasharray="5 5"
                  label={{
                    value: 'NO2 Dygnsmedelvärde (60 µg/m³)',
                    position: 'insideTopLeft',
                    fill: NO2_NORM_COLOR,
                    fontSize: 12,
                  }}
                />
              )}
              {showNo2HourlyNorm && (
                <ReferenceLine
                  y={90}
                  stroke={NO2_NORM_COLOR}
                  strokeDasharray="5 5"
                  label={{
                    value: 'NO2 Timmedelvärde (90 µg/m³)',
                    position: 'insideTopLeft',
                    fill: NO2_NORM_COLOR,
                    fontSize: 12,
                  }}
                />
              )}
            </BarChart>
          : <LineChart height={800} data={chartData} margin={chartMargin}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis interval={0} dataKey="observedAt" tickFormatter={formatAxisLabel} />
              <YAxis domain={domain} tickFormatter={(value: number) => formatValue(value)} />
              <Tooltip formatter={(value: number) => formatValue(value)} labelFormatter={formatTooltipLabel} />
              <Legend height={100} />
              {filteredData.map((pollutant) => (
                <Line
                  dataKey={PollutantType[pollutant.name as keyof typeof PollutantType]}
                  stroke={PollutantColor[pollutant.name as keyof typeof PollutantColor]}
                  name={PollutantType[pollutant.name as keyof typeof PollutantType]}
                  key={pollutant.name}
                />
              ))}
              {showPmNormLines && (
                <>
                  <ReferenceLine
                    y={30}
                    stroke={PM_NORM_COLOR}
                    strokeDasharray="5 5"
                    label={{ value: 'PM Miljömål (30 µg/m³)', position: 'insideTopLeft', fill: PM_NORM_COLOR, fontSize: 12 }}
                  />
                  <ReferenceLine
                    y={50}
                    stroke={PM_NORM_COLOR}
                    strokeDasharray="5 5"
                    label={{
                      value: 'PM Gränsvärde (50 µg/m³)',
                      position: 'insideTopLeft',
                      fill: PM_NORM_COLOR,
                      fontSize: 12,
                    }}
                  />
                </>
              )}
              {showNo2DailyNorm && (
                <ReferenceLine
                  y={60}
                  stroke={NO2_NORM_COLOR}
                  strokeDasharray="5 5"
                  label={{
                    value: 'NO2 Dygnsmedelvärde (60 µg/m³)',
                    position: 'insideTopLeft',
                    fill: NO2_NORM_COLOR,
                    fontSize: 12,
                  }}
                />
              )}
              {showNo2HourlyNorm && (
                <ReferenceLine
                  y={90}
                  stroke={NO2_NORM_COLOR}
                  strokeDasharray="5 5"
                  label={{
                    value: 'NO2 Timmedelvärde (90 µg/m³)',
                    position: 'insideTopLeft',
                    fill: NO2_NORM_COLOR,
                    fontSize: 12,
                  }}
                />
              )}
            </LineChart>
          }
        </ResponsiveContainer>
      </div>
    </div>
  );
};
