import { useAirStore } from '@services/air-service/air-service';
import { Button, Divider, MenuBar, Spinner } from '@sk-web-gui/react';
import { useEffect, useState } from 'react';
import { Pollutant, Value } from '@interfaces/airquality/airquality';
import { AirQualityGraph } from './air-quality-graph/air-quality-graph.component';
import { AirQualityTable } from './air-quality-table/air-quality-table.component';
import LucideIcon from '@sk-web-gui/lucide-icon';
import { AirQualityFilter } from './air-quality-filter/air-quality-filter.component';
import { PollutantType } from '@interfaces/pollutant/pollutant';

export interface IAirQualityTable {
  name: string;
  value: number;
  observedAt: string;
}

export default function AirQualityComponent() {
  const airQuality = useAirStore((state) => state.airQuality);
  const airQualityIsLoading = useAirStore((state) => state.airQualityIsLoading);
  const [graphData, setGraphData] = useState<Pollutant[]>();
  const [tableData, setTableData] = useState<
    {
      value: number;
      observedAt: string;
      name: string;
    }[]
  >([]);
  const [current, setCurrent] = useState<number>(0);
  const filter = useAirStore((state) => state.filter);

  useEffect(() => {
    if (airQuality && airQuality.pollutants && airQuality.pollutants.length > 0) {
      const airArray: Pollutant[] = [];
      const tableArr: {
        value: number;
        observedAt: string;
        name: string;
      }[] = [];
      const cleaned: {
        value: number;
        observedAt: string;
        name: string;
      }[] = [];
      console.log('cleaned', cleaned);
      airQuality.pollutants.forEach((pollutant) => {
        const pollutantValues: Value[] = [];
        const dublicateValues: Value[] = [];
        const dayValues: Value[] = [];

        pollutant.values.forEach((v) => {
          dublicateValues.push({
            value: v.value,
            observedAt: new Date(v.observedAt).toLocaleDateString(),
          });

          dayValues.push({
            value: v.value,
            observedAt: `Kl. ${new Date(v.observedAt).getHours() > 9 ? new Date(v.observedAt).getHours() : '0' + new Date(v.observedAt).getHours()}:00`,
          });
        });
        const groupedByTime = dayValues.reduce(
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
        const hours: string[] = [];

        pollutant.values.forEach((v) => {
          const date = new Date(v.observedAt).toLocaleDateString();
          const hour = `Kl. ${new Date(v.observedAt).getHours() > 9 ? new Date(v.observedAt).getHours() : '0' + new Date(v.observedAt).getHours()}:00`;
          if (!dates.includes(date)) {
            dates.push(date);
          }

          if (!hours.includes(hour)) {
            hours.push(hour);
          }
        });

        dates.forEach((d) => {
          if (groupedByDate[d]) {
            const averageValue =
              groupedByDate[d].reduce((partialSum, a) => partialSum + a.value, 0) / groupedByDate[d].length;
            cleaned.push({
              value: averageValue,
              observedAt: groupedByDate[d][0].observedAt,
              name: groupedByDate[d][0].name || '',
            });

            if (filter !== 'day') {
              tableArr.push({
                value: averageValue,
                observedAt: groupedByDate[d][0]?.observedAt,
                name: PollutantType[groupedByDate[d]?.[0].name as keyof typeof PollutantType],
              });
            }
          }
        });

        if (filter === 'day') {
          hours.forEach((h) => {
            groupedByTime[h].forEach((g) => {
              tableArr.push({
                value: g.value,
                observedAt: g.observedAt,
                name: PollutantType[g.name as keyof typeof PollutantType],
              });
            });
          });
        }
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
        if (filter === 'day') {
          airArray.push({
            name: pollutant.name,
            values: dayValues,
          });
        } else {
          airArray.push({
            name: pollutant.name,
            values: pollutantValues,
          });
        }
      });
      setTableData(tableArr);
      setGraphData(airArray);
    }
  }, [airQuality]);

  console.log(graphData);
  return airQuality ?
      <section className="flex flex-col items-center justify-center">
        {airQualityIsLoading ?
          <Spinner size={4} />
        : graphData && (
            <div className="w-full">
              <div className="w-full flex justify-end">
                <MenuBar current={current}>
                  <MenuBar.Item>
                    <Button
                      leftIcon={<LucideIcon name="chart-line" />}
                      onClick={() => {
                        setCurrent(0);
                      }}
                    >
                      Graf
                    </Button>
                  </MenuBar.Item>
                  <MenuBar.Item>
                    <Button
                      leftIcon={<LucideIcon name="table" />}
                      onClick={() => {
                        setCurrent(1);
                      }}
                    >
                      Tabell
                    </Button>
                  </MenuBar.Item>
                </MenuBar>
              </div>
              <Divider className="my-16" />
              <AirQualityFilter />
              {current === 0 && <AirQualityGraph graphData={graphData} />}
              {current === 1 && <AirQualityTable tableData={tableData} />}
            </div>
          )
        }
      </section>
    : <></>;
}
