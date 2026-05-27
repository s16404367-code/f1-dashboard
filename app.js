import {
  getLatestSession,
  getDrivers,
  getPositions,
  getWeather,
  getRadio,
  getRaceControl,
  getLaps
} from './modules/api.js';

import {
  renderTimingTower
} from './modules/timing.js';

import {
  renderTrack,
  renderDriverDots
} from './modules/map.js';

const sessionName =
  document.getElementById('sessionName');

const timingTower =
  document.getElementById('timingTower');

const weatherWidget =
  document.getElementById('weatherWidget');

const raceControlWidget =
  document.getElementById('raceControlWidget');

const radioWidget =
  document.getElementById('radioWidget');

const fastestLapWidget =
  document.getElementById('fastestLapWidget');

const driverFocusPanel =
  document.getElementById('driverFocusPanel');

const trackLayout =
  document.getElementById('trackLayout');

const trackMap =
  document.getElementById('trackMap');

let currentSession = null;

let drivers = [];
let positions = [];

let selectedDriver = null;

async function loadDashboard() {

  currentSession =
    await getLatestSession();

  if (!currentSession) {

    sessionName.innerHTML =
      'No Active Session';

    return;
  }

  sessionName.innerHTML =
    currentSession.meeting_name +
    ' - ' +
    currentSession.session_name;

  renderTrack(
    trackLayout,
    currentSession.meeting_name
  );

  drivers =
    await getDrivers(
      currentSession.session_key
    );

  positions =
    await getPositions(
      currentSession.session_key
    );

  renderEverything();

  loadWidgets();

  setInterval(async () => {

    positions =
      await getPositions(
        currentSession.session_key
      );

    renderEverything();

    loadWidgets();

  }, 10000);
}

function renderEverything() {

  renderTimingTower(
    timingTower,
    drivers,
    positions,
    selectedDriver,
    selectDriver
  );

  renderDriverDots(
    trackMap,
    drivers,
    positions,
    selectedDriver
  );
}

function selectDriver(
  driver,
  position
) {

  selectedDriver = driver;

  driverFocusPanel.innerHTML = `

    <div class="driver-focus-grid">

      <div class="focus-card">

        <div class="focus-card-title">
          Driver
        </div>

        <div class="focus-card-value">
          ${driver.full_name}
        </div>

      </div>

      <div class="focus-card">

        <div class="focus-card-title">
          Team
        </div>

        <div class="focus-card-value">
          ${driver.team_name}
        </div>

      </div>

      <div class="focus-card">

        <div class="focus-card-title">
          Position
        </div>

        <div class="focus-card-value">
          P${position.position}
        </div>

      </div>

      <div class="focus-card">

        <div class="focus-card-title">
          Driver Number
        </div>

        <div class="focus-card-value">
          #${driver.driver_number}
        </div>

      </div>

      <div class="focus-card">

        <div class="focus-card-title">
          Status
        </div>

        <div class="focus-card-value">
          RUNNING
        </div>

      </div>

      <div class="focus-card">

        <div class="focus-card-title">
          Gap
        </div>

        <div class="focus-card-value">
          +1.2s
        </div>

      </div>

    </div>
  `;

  renderEverything();
}

async function loadWidgets() {

  if (!currentSession) return;

  loadWeatherWidget();

  loadRaceControlWidget();

  loadRadioWidget();

  loadFastestLapWidget();
}

async function loadWeatherWidget() {

  const weather =
    await getWeather(
      currentSession.session_key
    );

  if (!weather.length) {

    weatherWidget.innerHTML =
      'No Weather Data';

    return;
  }

  const latest =
    weather[weather.length - 1];

  weatherWidget.innerHTML = `

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

    </div>
  `;
}

async function loadRaceControlWidget() {

  const raceControl =
    await getRaceControl(
      currentSession.session_key
    );

  if (!raceControl.length) {

    raceControlWidget.innerHTML =
      'No Race Control Data';

    return;
  }

  raceControlWidget.innerHTML =
    raceControl
      .slice(-5)
      .reverse()
      .map(item => `

        <div class="race-control-item">

          ${item.message}

        </div>

      `)
      .join('');
}

async function loadRadioWidget() {

  const radio =
    await getRadio(
      currentSession.session_key
    );

  if (!radio.length) {

    radioWidget.innerHTML =
      'No Radio Data';

    return;
  }

  radioWidget.innerHTML =
    radio
      .slice(-5)
      .reverse()
      .map(item => `

        <div class="radio-item">

          Driver #${item.driver_number}

        </div>

      `)
      .join('');
}

async function loadFastestLapWidget() {

  const laps =
    await getLaps(
      currentSession.session_key
    );

  if (!laps.length) {

    fastestLapWidget.innerHTML =
      'No Lap Data';

    return;
  }

  let bestLap = null;

  laps.forEach(lap => {

    if (!lap.lap_duration) return;

    if (
      !bestLap ||
      lap.lap_duration <
      bestLap.lap_duration
    ) {
      bestLap = lap;
    }
  });

  if (!bestLap) {

    fastestLapWidget.innerHTML =
      'No Fastest Lap';

    return;
  }

  fastestLapWidget.innerHTML = `

    <div class="widget-content">

      Driver:
      #${bestLap.driver_number}

      <br><br>

      Lap Time:
      ${bestLap.lap_duration}s

    </div>
  `;
}

loadDashboard();