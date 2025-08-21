import { useAirStore } from '@services/air-service/air-service';
import { Spinner } from '@sk-web-gui/react';
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import dayjs from 'dayjs';
import { PollutantColor, PollutantType } from '@interfaces/pollutant/pollutant';
import { Pollutant, Value } from '@interfaces/airquality/airquality';

export default function AirQualityComponent() {
  const airQuality = useAirStore((state) => state.airQuality);
  const airQualityIsLoading = useAirStore((state) => state.airQualityIsLoading);
  const [graphData, setGraphData] = useState<Pollutant[]>();

  useEffect(() => {
    if (airQuality && airQuality.pollutants && airQuality.pollutants.length > 0) {
      const airArray: Pollutant[] = [];
      const dateGroups: {
        [key: string]: {
          value: number;
          observedAt: string;
          name?: string;
        }[];
      }[] = [];
      const cleaned: {
        value: number;
        observedAt: string;
        name?: string;
      }[] = [];
      console.log(dateGroups);
      airQuality.pollutants.forEach((pollutant) => {
        const pollutantValues: Value[] = [];

        const dublicateValues: Value[] = [];

        pollutant.values.forEach((v) => {
          dublicateValues.push({
            value: v.value,
            observedAt: new Date(v.observedAt).toLocaleDateString(),
          });
        });
        const groupedByDate = dublicateValues.reduce(
          (
            group: {
              [key: string]: {
                value: number;
                observedAt: string;
                name?: string;
              }[];
            },
            v
          ) => {
            const { observedAt } = v;

            // Initialize the group if it doesn't exist
            if (!group[observedAt]) {
              group[observedAt] = [];
            }

            // Add the user to the corresponding age group
            group[observedAt].push({
              value: v.value,
              observedAt: v.observedAt,
              name: pollutant.name,
            });
            return group;
          },
          {} as {
            [key: string]: {
              value: number;
              observedAt: string;
              name?: string;
            }[];
          }
        );
        const dates: string[] = [];

        pollutant.values.forEach((v) => {
          const date = new Date(v.observedAt).toLocaleDateString();
          if (!dates.includes(date)) {
            dates.push(date);
          }
        });

        dates.forEach((d) => {
          if (groupedByDate[d]) {
            const averageValue =
              groupedByDate[d].reduce((partialSum, a) => partialSum + a.value, 0) / groupedByDate[d].length;
            cleaned.push({
              value: averageValue,
              observedAt: groupedByDate[d][0].observedAt,
              name: groupedByDate[d][0].name,
            });
          }
        });
        cleaned.forEach((c) => {
          if (c.name === pollutant.name) {
            pollutantValues.push({
              value: c.value,
              observedAt: c.observedAt,
            });
          }
        });
        // Sort pollutantValues by observedAt date
        pollutantValues.sort((a, b) => new Date(a.observedAt).getTime() - new Date(b.observedAt).getTime());
        console.log(pollutantValues);
        airArray.push({
          name: pollutant.name,
          values: pollutantValues,
        });
      });

      setGraphData(airArray);
    }
  }, [airQuality]);

  console.log(graphData);
  return airQuality ?
      <section style={{ maxWidth: '100%', height: '80vh' }} className="flex flex-col items-center justify-center">
        {airQualityIsLoading ?
          <Spinner size={4} />
        : graphData && (
            <ResponsiveContainer width="100%" height="100%" className="my-56">
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
                <YAxis dataKey="value" />
                <Tooltip />
                <Legend />
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
          )
        }
      </section>
    : <></>;
}
