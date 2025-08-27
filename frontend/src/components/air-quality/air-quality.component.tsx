import { useAirStore } from '@services/air-service/air-service';
import { Button, Divider, MenuBar, Spinner } from '@sk-web-gui/react';
import { useEffect, useState } from 'react';
import { Pollutant, Value } from '@interfaces/airquality/airquality';
import { AirQualityGraph } from './air-quality-graph/air-quality-graph.component';
import { AirQualityTable } from './air-quality-table/air-quality-table.component';
import LucideIcon from '@sk-web-gui/lucide-icon';
import { AirQualityFilter } from './air-quality-filter/air-quality-filter.component';
import { PollutantType } from '@interfaces/pollutant/pollutant';
import dayjs from 'dayjs';

export interface IAirQualityTable {
  name: string;
  value: number;
  observedAt: string;
}

export default function AirQualityComponent() {
  const airQuality = useAirStore((state) => state.airQuality);
  const airQualityIsLoading = useAirStore((state) => state.airQualityIsLoading);
  const [graphData, setGraphData] = useState<Pollutant[]>();
  const [tableData, setTableData] = useState<{ [key: string]: number | string }[]>([]);
  const [pollutantLabels, setPollutantLables] = useState<string[]>([]);
  const [flatData, setFlatData] = useState<
    {
      value: number;
      observedAt: string;
      name: string;
    }[]
  >([]);
  const [current, setCurrent] = useState<number>(0);
  const filter = useAirStore((state) => state.filter);
  const weekDays = ['Mån', 'Tis', 'Ons', 'Tors', 'Fre', 'Lör', 'Sön'];

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

      const pLabels: string[] = [];

      airQuality.pollutants.forEach((pollutant) => {
        const pollutantValues: Value[] = [];
        const dublicateValues: Value[] = [];
        const dayValues: Value[] = [];
        const monthValues: Value[] = [];

        const pName = PollutantType[pollutant.name as keyof typeof PollutantType];

        if (!pLabels.includes(pName)) {
          pLabels.push(pName);
        }

        pollutant.values.forEach((v) => {
          dublicateValues.push({
            value: v.value,
            observedAt:
              filter === 'week' ?
                `${dayjs(v.observedAt).format('DD MMM')} (${weekDays[dayjs(v.observedAt).day() === 0 ? 6 : dayjs(v.observedAt).day() - 1]})`
              : dayjs(v.observedAt).format('DD MMM'),
          });

          dayValues.push({
            value: v.value,
            observedAt: `${dayjs(v.observedAt).format('DD MMM')} (${weekDays[dayjs(v.observedAt).day() === 0 ? 6 : dayjs(v.observedAt).day() - 1]}) kl ${dayjs(v.observedAt).format('HH')}`,
          });

          monthValues.push({
            value: v.value,
            observedAt: dayjs(v.observedAt).format('MMMM YYYY'),
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

        const groupedByMonth = monthValues.reduce(
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
        const months: string[] = [];
        const hours: string[] = [];

        pollutant.values.forEach((v) => {
          const date =
            filter === 'week' ?
              `${dayjs(v.observedAt).format('DD MMM')} (${weekDays[dayjs(v.observedAt).day() === 0 ? 6 : dayjs(v.observedAt).day() - 1]})`
            : dayjs(v.observedAt).format('DD MMM');
          const hour = `${dayjs(v.observedAt).format('DD MMM')} (${weekDays[dayjs(v.observedAt).day() === 0 ? 6 : dayjs(v.observedAt).day() - 1]}) kl ${dayjs(v.observedAt).format('HH')}`;
          const month = dayjs(v.observedAt).format('MMMM YYYY');
          if (!dates.includes(date)) {
            dates.push(date);
          }

          if (!hours.includes(hour)) {
            hours.push(hour);
          }

          if (!months.includes(month)) {
            months.push(month);
          }
        });
        if (filter === 'week' || filter === 'month') {
          dates.forEach((d) => {
            if (groupedByDate[d]) {
              const averageValue =
                groupedByDate[d].reduce((partialSum, a) => partialSum + a.value, 0) / groupedByDate[d].length;
              cleaned.push({
                value: averageValue,
                observedAt: groupedByDate[d][0].observedAt,
                name: groupedByDate[d][0].name || '',
              });

              tableArr.push({
                value: averageValue,
                observedAt: groupedByDate[d][0]?.observedAt,
                name: PollutantType[groupedByDate[d]?.[0].name as keyof typeof PollutantType],
              });
            }
          });
        }

        if (filter === 'year') {
          months.forEach((m) => {
            if (groupedByMonth[m]) {
              const averageValue =
                groupedByMonth[m].reduce((partialSum, a) => partialSum + a.value, 0) / groupedByMonth[m].length;

              cleaned.push({
                value: averageValue,
                observedAt: groupedByMonth[m][0].observedAt,
                name: groupedByMonth[m][0].name || '',
              });

              tableArr.push({
                value: averageValue,
                observedAt: groupedByMonth[m][0]?.observedAt,
                name: PollutantType[groupedByMonth[m]?.[0].name as keyof typeof PollutantType],
              });
            }
          });
        }

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
      setFlatData(tableArr);
      setGraphData(airArray);
      setPollutantLables(pLabels);
    }
  }, [airQuality]);

  useEffect(() => {
    const allDates: string[] = [];
    const newData: {
      [key: string]: number | string;
    }[] = [];
    if (flatData) {
      flatData.forEach((f) => {
        if (!allDates.includes(f.observedAt)) {
          allDates.push(f.observedAt);
        }
      });

      if (allDates) {
        const allData: {
          observedAt: string;
          data: {
            [key: string]: number;
          }[];
        }[] = [];
        allDates.forEach((a) => {
          const pollutantsArr: { [key: string]: number }[] = [];
          allData.push({
            observedAt: a,
            data: pollutantsArr,
          });

          flatData.forEach((f) => {
            if (a === f.observedAt && typeof f.value === 'number') {
              pollutantsArr.push({
                [f.name]: f.value,
              });
            }
          });
        });

        if (allData) {
          allData.forEach((ad) => {
            newData.push({
              observedAt: ad.observedAt,
              ...Object.assign({}, ...ad.data),
            });
          });
        }
      }
    }
    setTableData(newData);
  }, [flatData]);

  return airQuality ?
      <section className="flex flex-col items-center justify-center">
        {airQualityIsLoading ?
          <div className="w-full h-[60vh] py-24 flex justify-center items-center">
            <Spinner size={4} />
          </div>
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
              {current === 1 && <AirQualityTable tableData={tableData} pollutantLabels={pollutantLabels} />}
            </div>
          )
        }
      </section>
    : <></>;
}
