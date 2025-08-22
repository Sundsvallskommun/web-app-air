import { useAirStore } from '@services/air-service/air-service';
import { Button, MenuBar, Spinner } from '@sk-web-gui/react';
import { useEffect, useState } from 'react';
import { Pollutant, Value } from '@interfaces/airquality/airquality';
import { AirQualityGraph } from './air-quality-graph/air-quality-graph.component';
import { AirQualityTable } from './air-quality-table/air-quality-table.component';
import LucideIcon from '@sk-web-gui/lucide-icon';
import { AirQualityFilter } from './air-quality-filter/air-quality-filter.component';

export interface IAirQualityTable {
  name: string;
  value: number;
  observedAt: string;
}

export default function AirQualityComponent() {
  const airQuality = useAirStore((state) => state.airQuality);
  const airQualityIsLoading = useAirStore((state) => state.airQualityIsLoading);
  const [graphData, setGraphData] = useState<Pollutant[]>();
  const [tableData, setTableData] = useState<IAirQualityTable[]>([]);
  const [showGraph, setShowGraph] = useState<boolean>(true);
  const [showTable, setShowTable] = useState<boolean>(false);
  const [current, setCurrent] = useState<number>(0);

  useEffect(() => {
    if (airQuality && airQuality.pollutants && airQuality.pollutants.length > 0) {
      const airArray: Pollutant[] = [];

      const cleaned: {
        value: number;
        observedAt: string;
        name: string;
      }[] = [];
      console.log('cleaned', cleaned);
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
              name: groupedByDate[d][0].name || '',
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
        airArray.push({
          name: pollutant.name,
          values: pollutantValues,
        });
      });

      setGraphData(airArray);
      setTableData(cleaned);
    }
  }, [airQuality]);

  console.log(graphData);
  return airQuality ?
      <section className="flex flex-col items-center justify-center">
        {airQualityIsLoading ?
          <Spinner size={4} />
        : graphData && (
            <div className="w-full">
              <MenuBar showBackground current={current}>
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
              <AirQualityFilter />
              {current === 0 && <AirQualityGraph graphData={graphData} />}
              {current === 1 && <AirQualityTable tableData={tableData} />}
            </div>
          )
        }
      </section>
    : <></>;
}
