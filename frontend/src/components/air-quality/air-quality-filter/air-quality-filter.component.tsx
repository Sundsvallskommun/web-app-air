import { useAirStore } from '@services/air-service/air-service';
import { Button, Label, MenuBar } from '@sk-web-gui/react';
import { useState } from 'react';

export const AirQualityFilter = () => {
  const filter = useAirStore((state) => state.filter);
  const setFilter = useAirStore((state) => state.setFilter);
  const filters = [
    {
      label: 'År',
      id: 0,
      value: 'year',
    },
    {
      label: 'Månad',
      id: 1,
      value: 'month',
    },
    {
      label: 'Vecka',
      id: 2,
      value: 'week',
    },
    {
      label: 'Dygn',
      id: 3,
      value: 'day',
    },
  ];
  const [currentFilter, setCurrentFilter] = useState<number>(filters.find((x) => x.value === filter)?.id ?? 0);

  console.log(currentFilter);

  return (
    <div>
      <label className="sk-form-labl">Visa Luftkvalitet från senaste</label>
      <MenuBar showBackground className="w-fit p-8">
        {filters.map((item) => {
          return (
            <MenuBar.Item key={item.id} current={currentFilter === item.id}>
              <Button
                inverted
                variant={currentFilter === item.id ? 'primary' : 'secondary'}
                onClick={() => {
                  setCurrentFilter(item.id);
                  setFilter(item.value);
                }}
              >
                {item.label}
              </Button>
            </MenuBar.Item>
          );
        })}
      </MenuBar>
    </div>
  );
};
