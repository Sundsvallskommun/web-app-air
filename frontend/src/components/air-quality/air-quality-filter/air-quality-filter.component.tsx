import { useAirStore } from '@services/air-service/air-service';
import { Button } from '@sk-web-gui/react';
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
  let filterHeading;

  switch (filter) {
    case 'day':
      filterHeading = 'senaste dygnet';
      break;
    case 'week':
      filterHeading = 'senaste veckan';
      break;
    case 'month':
      filterHeading = 'senaste månaden';
      break;
    case 'year':
      filterHeading = 'senaste året';
      break;
  }

  return (
    <div className="flex flex-wrap gap-16 justify-between items-center container">
      <div>
        <h1 className="text-h2-sm">Luftkvalitet {filterHeading}</h1>
      </div>
      <div className="flex flex-wrap items-center">
        <label className="sk-form-labl font-semibold mr-12 flex-none">Visa från senaste:</label>
        <Button.Group>
          {filters.map((item, idx) => {
            return (
              <Button
                key={idx}
                inverted={currentFilter === item.id}
                variant={currentFilter === item.id ? 'primary' : 'tertiary'}
                onClick={() => {
                  setCurrentFilter(item.id);
                  setFilter(item.value);
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Button.Group>
      </div>
    </div>
  );
};
