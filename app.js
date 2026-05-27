import {
  getLatestSession,
  getSessionsByYear,
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

const seasonSelector =
  document.getElementById('seasonSelector');

const eventSelector =
  document.getElementById('eventSelector');

const loadSessionBtn =
  document.getElementById('loadSessionBtn');

let currentSession = null;

let drivers = [];
let positions = [];

let selectedDriver = null;

async function initialize() {

  await populateEvents(
    seasonSelector.value
  );

  currentSession =
    await getLatestSession();

  if (currentSession) {

    await loadFullDashboard(
      currentSession
    );
  }
}

async function populateEvents(
  year
) {

  const sessions =
    await getSessionsByYear(year);

  eventSelector.innerHTML = '';

  const meetings = {};

  sessions.forEach(session => {

    meetings[
      session.meeting_name
    ] = session;
  });

  Object.values(meetings)
    .forEach(meeting => {

      const option =
        document.createElement('option');

      option.value =
        meeting.session_key;

      option.textContent =
        meeting.meeting_name;

      eventSelector.appendChild(option);
    });
}

async function loadFullDashboard(
  session
) {

  currentSession = session;

  sessionName.innerHTML =
    session.meeting_name +
    ' - ' +
    session.session_name;

  renderTrack(
    trackLayout,
    session.meeting_name
  );

  drivers =
    await getDrivers(
      session.session_key
    );

  positions =
    await getPositions(
      session.session_key
    );

  renderEverything();

  await loadWidgets();

  setInterval(async () => {

    positions =
      await getPositions(
        currentSession.session_key
      );

    renderEverything();

    await loadWidgets();

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
          Number
        </div>

        <div class="focus-card-value">
          #${driver.driver_number}
        </div>
      </div>

    </div>
  `;

  renderEverything();
}

async function loadWidgets() {

  if (!currentSession) return;

  const weather =
    await getWeather(
      currentSession.session_key
    );

  weatherWidget.innerHTML =
    weather.length
      ? JSON.stringify(
          weather[weather.length - 1],
          null,
          2
        )
      : 'No Weather Data';

  const raceControl =
    await getRaceControl(
      currentSession.session_key
    );

  raceControlWidget.innerHTML =
    raceControl.length
      ? raceControl
          .slice(-5)
          .map(item => item.message)
          .join('<br><br>')
      : 'No Race Control Data';

  const radio =
    await getRadio(
      currentSession.session_key
    );

  radioWidget.innerHTML =
    radio.length
      ? radio
          .slice(-5)
          .map(item =>
            'Driver #' +
            item.driver_number
          )
          .join('<br><br>')
      : 'No Radio Data';

  const laps =
    await getLaps(
      currentSession.session_key
    );

  fastestLapWidget.innerHTML =
    laps.length
      ? 'Lap Data Loaded'
      : 'No Lap Data';
}

seasonSelector.onchange =
  async () => {

    await populateEvents(
      seasonSelector.value
    );
  };

loadSessionBtn.onclick =
  async () => {

    const selected =
      eventSelector.value;

    const sessions =
      await getSessionsByYear(
        seasonSelector.value
      );

    const session =
      sessions.find(
        s =>
          String(s.session_key) ===
          String(selected)
      );

    if (!session) return;

    await loadFullDashboard(
      session
    );
  };

initialize();