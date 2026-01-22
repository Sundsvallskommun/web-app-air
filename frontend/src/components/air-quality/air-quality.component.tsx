import { useAirStore } from '@services/air-service/air-service';
import { Button, Divider, NavigationBar, Spinner, useSnackbar } from '@sk-web-gui/react';
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

type ViewType = 'line' | 'bar' | 'table';

export default function AirQualityComponent() {
  const airQuality = useAirStore((state) => state.airQuality);
  const airQualityIsLoading = useAirStore((state) => state.airQualityIsLoading);
  const airQualityError = useAirStore((state) => state.airQualityError);
  const filter = useAirStore((state) => state.filter);

  const [currentView, setCurrentView] = useState<ViewType>('line');
  const [desktop, setDesktop] = useState(false);
  const toastMessage = useSnackbar();

  const { graphData, tableData, pollutantLabels } = useAirQualityData(airQuality, filter);

  useEffect(() => {
    if (airQualityError) {
      toastMessage({
        status: 'error',
        message: airQualityError,
      });
    }
  }, [airQualityError, toastMessage]);

  const viewIndex = currentView === 'line' ? 0 : currentView === 'bar' ? 1 : 2;

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
                <NavigationBar current={viewIndex}>
                  <NavigationBar.Item>
                    <Button
                      leftIcon={<LucideIcon name="chart-line" />}
                      onClick={() => setCurrentView('line')}
                    >
                      Linjediagram
                    </Button>
                  </NavigationBar.Item>
                  <NavigationBar.Item>
                    <Button
                      leftIcon={<LucideIcon name="chart-column" />}
                      onClick={() => setCurrentView('bar')}
                    >
                      Stapeldiagram
                    </Button>
                  </NavigationBar.Item>
                  <NavigationBar.Item>
                    <Button
                      leftIcon={<LucideIcon name="table" />}
                      onClick={() => setCurrentView('table')}
                    >
                      Tabell
                    </Button>
                  </NavigationBar.Item>
                </NavigationBar>
              </div>
              <Divider className="my-16" />
              <AirQualityFilter />
              {(currentView === 'line' || currentView === 'bar') && (
                <AirQualityGraph graphData={graphData} chartType={currentView} />
              )}
              {currentView === 'table' && (
                <div className="px-16">
                  <AirQualityTable tableData={tableData} pollutantLabels={pollutantLabels} />
                </div>
              )}
            </>
          : <>
              <AirQualityFilter />
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
