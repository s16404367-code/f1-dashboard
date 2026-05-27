export function renderWeather(
  container,
  weather
) {

  if (!weather.length) {

    container.innerHTML =
      'No Weather Data';

    return;
  }

  const latest =
    weather[weather.length - 1];

  container.innerHTML = `

    <div class="widget-content">

      Air Temp:
      ${latest.air_temperature}°C

      <br><br>

      Track Temp:
      ${latest.track_temperature}°C

      <br><br>

      Humidity:
      ${latest.humidity}%

      <br><br>

      Wind Speed:
      ${latest.wind_speed} km/h

      <br><br>

      Pressure:
      ${latest.air_pressure} hPa

    </div>
  `;
}