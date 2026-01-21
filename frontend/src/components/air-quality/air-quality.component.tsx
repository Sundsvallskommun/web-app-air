import { useAirStore } from '@services/air-service/air-service';
import { Button, Divider, NavigationBar, Spinner } from '@sk-web-gui/react';
import { useEffect, useState } from 'react';
import { AirQualityGraph } from './air-quality-graph/air-quality-graph.component';
import { AirQualityTable } from './air-quality-table/air-quality-table.component';
import LucideIcon from '@sk-web-gui/lucide-icon';
import { AirQualityFilter } from './air-quality-filter/air-quality-filter.component';
import { useAirQualityData } from '@hooks/useAirQualityData';

export interface IAirQualityTable {
  name: string;
  value: number;
  observedAt: string;
}

export default function AirQualityComponent() {
  const airQuality = useAirStore((state) => state.airQuality);
  const airQualityIsLoading = useAirStore((state) => state.airQualityIsLoading);
  const airQualityError = useAirStore((state) => state.airQualityError);
  const filter = useAirStore((state) => state.filter);

  const [current, setCurrent] = useState<number>(0);
  const [desktop, setDesktop] = useState(false);

  const { graphData, tableData, pollutantLabels } = useAirQualityData(airQuality, filter);

  useEffect(() => {
    const handleResize = () => {
      setDesktop(window.screen.width >= 760);
    };

    handleResize();
    window.addEventListener('resize', handleResize, false);

    return () => {
      window.removeEventListener('resize', handleResize, false);
    };
  }, []);

  return (
    <section className="flex flex-col items-center justify-center">
      {airQualityIsLoading ?
        <div className="w-full h-[60vh] py-24 flex justify-center items-center">
          <Spinner size={4} />
        </div>
      : <div className="w-full">
          {desktop ?
            <>
              <div className="container flex justify-end">
                <NavigationBar current={current}>
                  <NavigationBar.Item>
                    <Button
                      leftIcon={<LucideIcon name="chart-line" />}
                      onClick={() => {
                        setCurrent(0);
                      }}
                    >
                      Graf
                    </Button>
                  </NavigationBar.Item>
                  <NavigationBar.Item>
                    <Button
                      leftIcon={<LucideIcon name="table" />}
                      onClick={() => {
                        setCurrent(1);
                      }}
                    >
                      Tabell
                    </Button>
                  </NavigationBar.Item>
                </NavigationBar>
              </div>
              <Divider className="my-16" />
              <AirQualityFilter />
              {airQualityError && (
                <div className="container my-16">
                  <div className="p-16 bg-error-surface-primary text-error rounded-lg border border-error">
                    {airQualityError}
                  </div>
                </div>
              )}
              {current === 0 && <AirQualityGraph graphData={graphData} />}
              {current === 1 && (
                <div className="px-16">
                  <AirQualityTable tableData={tableData} pollutantLabels={pollutantLabels} />
                </div>
              )}
            </>
          : <>
              <AirQualityFilter />
              {airQualityError && (
                <div className="container my-16">
                  <div className="p-16 bg-error-surface-primary text-error rounded-lg border border-error">
                    {airQualityError}
                  </div>
                </div>
              )}
              <div className="px-16">
                <AirQualityTable tableData={tableData} pollutantLabels={pollutantLabels} />
              </div>
            </>
          }
        </div>
      }
    </section>
  );
}
