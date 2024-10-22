import { fetchWeatherApi } from 'openmeteo';
import type { HourlyWeather } from '@server/common/models/weather.model.ts';

export async function getWeather(date: string): Promise<HourlyWeather[]> {
  const params = {
    'latitude': 49.465691,
    'longitude': -2.585278,
    'hourly': [
      'temperature_2m',
      'relative_humidity_2m',
      'precipitation',
      'visibility',
      'wind_speed_10m',
      'wind_direction_10m',
    ],
    'timezone': 'Europe/London',
    'start_date': date,
    'end_date': date,
  };
  const url = 'https://api.open-meteo.com/v1/forecast';
  const responses = await fetchWeatherApi(url, params);

  const range = (start: number, stop: number, step: number) =>
    Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

  const response = responses[0];

  const utcOffsetSeconds = response.utcOffsetSeconds();
  const hourly = response.hourly()!;

  const weatherData = {
    hourly: {
      time: range(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval()).map(
        (t) => new Date((t + utcOffsetSeconds) * 1000),
      ),
      temperature2m: hourly.variables(0)!.valuesArray()!,
      relativeHumidity2m: hourly.variables(1)!.valuesArray()!,
      precipitation: hourly.variables(2)!.valuesArray()!,
      visibility: hourly.variables(3)!.valuesArray()!,
      windSpeed10m: hourly.variables(4)!.valuesArray()!,
      windDirection10m: hourly.variables(5)!.valuesArray()!,
    },
  };

  const mappedWeatherDataHourly: HourlyWeather[] = [];

  for (let i = 0; i < weatherData.hourly.time.length; i++) {
    mappedWeatherDataHourly.push({
      date: weatherData.hourly.time[i],
      temperature: weatherData.hourly.temperature2m[i],
      relativeHumidity: weatherData.hourly.relativeHumidity2m[i],
      precipitation: weatherData.hourly.precipitation[i],
      visibility: weatherData.hourly.visibility[i],
      windSpeed10m: weatherData.hourly.windSpeed10m[i],
      windDirection10m: weatherData.hourly.windDirection10m[i],
    });
  }

  return mappedWeatherDataHourly;
}
