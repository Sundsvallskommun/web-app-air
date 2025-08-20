import { useAirStore } from '@services/air-service/air-service';
import { Spinner } from '@sk-web-gui/react';
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';
import { PollutantType } from '@interfaces/pollutant/pollutant';

interface AirQualityGraph {
  [key: string]: string | number | [] | object | null | undefined;
}

export default function AirQualityComponent() {
  const airQuality = useAirStore((state) => state.airQuality);
  const airQualityIsLoading = useAirStore((state) => state.airQualityIsLoading);
  const [graphData, setGraphData] = useState<AirQualityGraph[]>();

  useEffect(() => {
    if (airQuality && airQuality.pollutants && airQuality.pollutants.length > 0) {
      const airArray: AirQualityGraph[] = [];
      airQuality.pollutants.forEach((pollutant) => {
        pollutant.values.forEach((v) => {
          airArray.push({
            name: pollutant.name,
            observedAt: dayjs(v.observedAt).format('DD/MM/YY'),
            [pollutant.name]: v.value,
          });
        });
      });
      setGraphData(airArray);
    }
  }, [airQuality]);

  console.log(airQuality);
  return (
    <section>
      <div className="text-content">
        <p>Information om luftkvalitet blablabla</p>
      </div>
      <div>
        {airQualityIsLoading ?
          <Spinner size={4} />
        : graphData && (
            <LineChart width={1020} height={300} data={graphData}>
              <CartesianGrid />

              <Line
                dataKey={PollutantType.AtmosphericPressure}
                stroke="purple"
                name={PollutantType.AtmosphericPressure}
              />
              <Line dataKey={PollutantType.RelativeHumidity} stroke="green" name={PollutantType.RelativeHumidity} />
              <Line dataKey={PollutantType.Temperature} stroke="pink" name={PollutantType.Temperature} />
              <Line
                dataKey={PollutantType.TotalSuspendedParticulate}
                stroke="grey"
                name={PollutantType.TotalSuspendedParticulate}
              />
              <Line dataKey={PollutantType.PM1} stroke="lightblue" name={PollutantType.PM1} />
              <Line dataKey={PollutantType.PM4} stroke="yellow" name={PollutantType.PM4} />
              <Line dataKey={PollutantType.PM10} stroke="darkblue" name={PollutantType.PM10} />
              <Line dataKey={PollutantType.PM25} stroke="cyan" name={PollutantType.PM25} />
              <Line dataKey={PollutantType.NO} stroke="red" name={PollutantType.NO} />
              <Line dataKey={PollutantType.NO2} stroke="orange" name={PollutantType.NO2} />
              <Line dataKey={PollutantType.NOx} stroke="black" name={PollutantType.NOx} />

              <XAxis dataKey="observedAt" />
              <YAxis />
              <Legend />
            </LineChart>
          )
        }
      </div>
    </section>
  );
}
