import { useAirStore, STATION_KOPMANGATAN, STATION_BERGSGATAN, ParameterGroup } from '@services/air-service/air-service';
import { Button, RadioButton, Select } from '@sk-web-gui/react';

const stationOptions = [
  { label: 'Köpmangatan', value: STATION_KOPMANGATAN },
  { label: 'Bergsgatan', value: STATION_BERGSGATAN },
];

const parameterOptions: { label: string; value: ParameterGroup; kopmangatanOnly?: boolean }[] = [
  { label: 'PM10 & PM2.5', value: 'pm' },
  { label: 'NO2', value: 'no2', kopmangatanOnly: true },
];

export const AirQualityFilter = () => {
  const filter = useAirStore((state) => state.filter);
  const setFilter = useAirStore((state) => state.setFilter);
  const station = useAirStore((state) => state.station);
  const setStation = useAirStore((state) => state.setStation);
  const parameterGroup = useAirStore((state) => state.parameterGroup);
  const setParameterGroup = useAirStore((state) => state.setParameterGroup);

  const isKopmangatan = station === STATION_KOPMANGATAN;
  const filters = [
    // Commented out due to API limitation (max 100 data points)
    // Uncomment when API can return more data
    // {
    //   label: 'År',
    //   id: 0,
    //   value: 'year',
    // },
    // {
    //   label: 'Månad',
    //   id: 1,
    //   value: 'month',
    // },
    // {
    //   label: 'Vecka',
    //   id: 2,
    //   value: 'week',
    // },
    {
      label: '4 dagar',
      id: 0,
      value: 'fourdays',
    },
    {
      label: 'Dygn',
      id: 1,
      value: 'day',
    },
  ];
  const currentFilterId = filters.find((x) => x.value === filter)?.id ?? 0;
  const stationName = stationOptions.find((s) => s.value === station)?.label ?? 'Köpmangatan';

  let filterHeading;
  switch (filter) {
    case 'day':
      filterHeading = 'senaste dygnet';
      break;
    case 'fourdays':
      filterHeading = 'senaste 4 dagarna (dygnsmedelvärde)';
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
        <h1 className="text-h2-sm">Luftkvalitet vid {stationName} {filterHeading}</h1>
      </div>
      <div className="flex flex-wrap items-center gap-16">
        <div className="flex items-center">
          <label className="sk-form-label font-semibold mr-12 flex-none">Mätstation:</label>
          <Select
            value={station}
            onChange={(e) => setStation(e.target.value)}
            data-testid="station-select"
          >
            {stationOptions.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </div>
        <div className="flex items-center">
          <label className="sk-form-label font-semibold mr-12 flex-none">Visa från senaste:</label>
          <Button.Group>
            {filters.map((item, idx) => {
              return (
                <Button
                  key={idx}
                  inverted={currentFilterId === item.id}
                  variant={currentFilterId === item.id ? 'primary' : 'tertiary'}
                  onClick={() => {
                    setFilter(item.value);
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Button.Group>
        </div>
        <div className="flex items-center">
          <label className="sk-form-label font-semibold mr-12 flex-none">Parameter:</label>
          <RadioButton.Group inline>
            {parameterOptions.map((option) => {
              const isDisabled = option.kopmangatanOnly && !isKopmangatan;
              return (
                <RadioButton
                  key={option.value}
                  name="parameterGroup"
                  value={option.value}
                  checked={parameterGroup === option.value}
                  disabled={isDisabled}
                  onChange={() => setParameterGroup(option.value)}
                >
                  {option.label}
                </RadioButton>
              );
            })}
          </RadioButton.Group>
        </div>
      </div>
    </div>
  );
};
