import { useAirStore } from '@services/air-service/air-service';
import { Spinner } from '@sk-web-gui/react';

export default function AirQualityComponent() {
  const airQuality = useAirStore((state) => state.airQuality);
  const airQualityIsLoading = useAirStore((state) => state.airQualityIsLoading);

  console.log(airQuality);
  return (
    <section>
      <div className="text-content">
        <p>Information om luftkvalitet blablabla</p>
      </div>
      <div>
        {airQualityIsLoading ?
          <Spinner size={4} />
        : <span>Klar</span>}
      </div>
    </section>
  );
}
