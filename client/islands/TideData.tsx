import { apiService } from '@client/services/api.service.ts';
import { useEffect, useState } from 'preact/hooks';
import { addDays, differenceInMilliseconds, format, parseISO, subDays } from 'date-fns';
import CollapsibleSection from '@client/islands/CollapsibleSection.tsx';
import { TideSequenceService } from '../services/tide-sequence.service.ts';
import WaveSpinner from '@client/components/WaveSpinner.tsx';

interface TideProps {
  date: string;
}

export interface HourlyWeather {
  date: Date;
  temperature: number;
  relativeHumidity: number;
  precipitation: number;
  visibility: number;
  windSpeed10m: number;
  windDirection10m: number;
}

export interface TideData {
  Date: Date;
  Weather: HourlyWeather[];
  BasicTide: Record<string, string>[] | null;
  PrecisionTides: Record<string, string>[] | null;
}

export default function TideButton(props: TideProps) {
  const [tides, setTides] = useState<TideData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const tideService = new TideSequenceService();

  const fetchTides = async (date: string | null) => {
    try {
      setLoading(true);
      setError('');

      date ? date : props.date;

      const response = await apiService.get<TideData[]>(`tide?date=${date}`);

      console.log(response);
      setTides(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTides(format(new Date(), 'yyyy-MM-dd'));
  }, [props.date]);

  const formatDate = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
  };

  const fetchForToday = () => {
    fetchTides(format(new Date(), 'yyyy-MM-dd'));
  };

  const fetchForYesterday = () => {
    const yesterday = subDays(new Date(), 1);

    fetchTides(format(yesterday, 'yyyy-MM-dd'));
  };

  const fetchForTomorrow = () => {
    const tomorrow = addDays(new Date(), 1);

    fetchTides(format(tomorrow, 'yyyy-MM-dd'));
  };

  const isTomorrowButtonDisabled = () => {
    const tomorrow = addDays(new Date(), 1);

    return tides.some((x) => format(x.Date, 'yyyy-MM-dd') == format(tomorrow, 'yyyy-MM-dd'));
  };

  const isYesterdayButtonDisabled = () => {
    const yesterday = subDays(new Date(), 1);

    return tides.some((x) => format(x.Date, 'yyyy-MM-dd') == format(yesterday, 'yyyy-MM-dd'));
  };

  const isTodayButtonDisabled = () => {
    return tides.some((x) => format(x.Date, 'yyyy-MM-dd') == format(new Date(), 'yyyy-MM-dd'));
  };

  const findClosestDate = (dates: Date[]) => {
    const now = new Date();

    return dates.reduce((closest, current) => {
      const currentDate = typeof current === 'string'
        ? parseISO(format(current, 'yyyy-MM-dd HH:mm'))
        : current;
      const closestDate = typeof current === 'string'
        ? parseISO(format(closest, 'yyyy-MM-dd HH:mm'))
        : closest;

      const currentDiff = Math.abs(differenceInMilliseconds(now, currentDate));
      const closestDiff = Math.abs(differenceInMilliseconds(now, closestDate));

      return currentDiff < closestDiff ? current : closest;
    });
  };

  const formatWeather = (weather: HourlyWeather[]) => {
    if (!weather) return 'No Weather data';

    const latest = weather.find((x) => x.date == findClosestDate(weather.map((x) => x.date)));

    return (
      <div class='grid gird-cols-2 gap-2 text-sm'>
        <div>Temp: {Math.round(latest!.temperature * 100) / 100}°C</div>
        <div>Humidity: {latest?.relativeHumidity}%</div>
        <div>
          Wind: {Math.round(latest!.windSpeed10m * 100) / 100}Mph |{' '}
          {formatWindDirection(latest?.windDirection10m)}
        </div>
        <div>Visibility: {Math.round(latest!.visibility) / 1000}Km</div>
      </div>
    );
  };

  const formatTideData = (tideData: Record<string, string>[] | null) => {
    if (!tideData) return 'No tide data available';

    return (
      <div class='space-y-1'>
        {tideData.map((tide, index) => (
          <div key={index} class='text-sm'>
            {Object.values(tide).map((value, valueIndex) => (
              <span key={valueIndex} class='mr-4'>
                {value}
              </span>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const formatPrecisionTideData = (precisionTideData: Record<string, string>[] | null) => {
    if (!precisionTideData) return 'No hourly tide data available';

    formatTimeMainPoolIsExposed(precisionTideData);

    return (
      <div class='space-y-1'>
        {precisionTideData.map((tide, index) => (
          <div key={index} class='text-sm'>
            {Object.entries(tide).map(([time, height]) => (
              <span class='mr-4'>
                {time}: {height}
              </span>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const formatWindDirection = (angle: number | undefined) => {
    if (angle == undefined) {
      return 'Unknown';
    }

    const directions = [
      'North',
      'North-East',
      'East',
      'South-East',
      'South',
      'South-West',
      'West',
      'North-West',
    ];
    const index = Math.round(((angle %= 360) < 0 ? angle + 360 : angle) / 45) % 8;

    return directions[index];
  };

  const formatTimeMainPoolIsExposed = (precisionTideData: Record<string, string>[] | null) => {
    if (!precisionTideData) return 'No hourly tide data available';

    const extremes = tideService.processTideData(precisionTideData);

    return (
      <div>
        {extremes && (
          <div>
            {extremes.cycles.map((extreme, index) => (
              <div key={index} class='text-sm py-1'>
                <p>Tide Cycle {index + 1}</p>
                <p>Times: {extreme.startTime} - {extreme.endTime}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div class='space-y-4'>
      <div class='flex justify-center gap-2'>
        <button
          onClick={fetchForYesterday}
          disabled={loading || isYesterdayButtonDisabled()}
          class='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 transition-colors'
        >
          {loading ? 'Loading...' : 'Yesterday'}
        </button>

        <button
          onClick={fetchForToday}
          disabled={loading || isTodayButtonDisabled()}
          class='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 transition-colors'
        >
          {loading ? 'Loading...' : 'Today'}
        </button>

        <button
          onClick={fetchForTomorrow}
          disabled={loading || isTomorrowButtonDisabled()}
          class='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 transition-colors'
        >
          {loading ? 'Loading...' : 'Tomorrow'}
        </button>
      </div>

      {error && (
        <div class='p-4 bg-red-100 text-red-700 rounded'>
          {error}
        </div>
      )}

      {loading && (
        <div class="flex justify-center gap-2">
          <WaveSpinner />
        </div>
      )}

      {!loading && tides.length > 0 && (
        <div class='space-y-6'>
          {tides.map((tide, index) => (
            <div key={index} class='p-4 border rounded-lg bg-white shadow-sm'>
              <div class='space-y-4'>
                <h3 class='font-semibold text-lg'>
                  {formatDate(tide.Date)}
                </h3>

                <div class='space-y-2'>
                  <div class='bg-gray-50 p-3 rounded'>
                    <h4 class='font-medium mb-2'>Tide Data</h4>
                    {formatTideData(tide.BasicTide)}
                  </div>

                  <div class='bg-gray-50 p-3 rounded'>
                    <h4 class='font-medium mb-2'>Weather</h4>
                    {formatWeather(tide.Weather)}
                  </div>

                  <div class='bg-gray-50 p-3 rounded'>
                    <h4 class='font-medium mb-2'>Pool Exposed Times</h4>
                    {formatTimeMainPoolIsExposed(tide.PrecisionTides)}
                  </div>

                  <CollapsibleSection title='Precise Tide Data'>
                    <div class='bg-gray-50 p-3 rounded'>
                      <h4 class='font-medium mb-2'>Precise Tide Data</h4>
                      {formatPrecisionTideData(tide.PrecisionTides)}
                    </div>
                  </CollapsibleSection>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
