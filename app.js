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

  try {

    await populateEvents(
      seasonSelector.value
    );

    currentSession =
      await getLatestSession();

    if (!currentSession) {

      sessionName.innerHTML =
        'No Active Session';

      return;
    }

    sessionName.innerHTML =
      (currentSession.meeting_name || 'Unknown Event') +
      ' - ' +
      (currentSession.session_name || 'Unknown Session');

    populateTrack();

    await loadFullDashboard(
      currentSession
    );

  } catch (error) {

    console.log(error);

    sessionName.innerHTML =
      'Dashboard Initialization Failed';
  }
}

async function populateEvents(
  year
) {

  try {

    const sessions =
      await getSessionsByYear(year);

    eventSelector.innerHTML = '';

    const uniqueMeetings = {};

    sessions.forEach(session => {

      if (!session.meeting_name) return;

      uniqueMeetings[
        session.meeting_name
      ] = session;
    });

    Object.values(uniqueMeetings)
      .forEach(meeting => {

        const option =
          document.createElement('option');

        option.value =
          meeting.session_key;

        option.textContent =
          meeting.meeting_name;

        eventSelector.appendChild(option);
      });

  } catch (error) {

    console.log(error);

    eventSelector.innerHTML =
      '<option>Failed</option>';
  }
}

function populateTrack() {

  if (
    !currentSession ||
    !currentSession.meeting_name
  ) {

    trackLayout.setAttribute(
      'd',
      'M180 300 C250 120 750 120 820 300 C750 480 250 480 180 300'
    );

    return;
  }

  const TRACKS = {

    Bahrain:
      'M180 300 L300 120 L700 120 L820 300 L700 480 L300 480 Z',

    Monaco:
      'M220 300 C220 120 650 120 700 260 C720 420 320 500 220 300',

    Silverstone:
      'M100 300 L240 120 L700 120 L850 300 L700 480 L240 480 Z',

    Spa:
      'M120 340 C200 100 720 100 860 320 C720 520 240 520 120 340',

    Monza:
      'M220 140 L760 140 L860 300 L760 460 L220 460 L120 300 Z',

    Singapore:
      'M150 300 C250 80 700 80 820 300 C700 520 250 520 150 300'
  };

  const name =
    currentSession.meeting_name;

  for (const track in TRACKS) {

    if (
      typeof name === 'string' &&
      name.includes(track)
    ) {

      trackLayout.setAttribute(
        'd',
        TRACKS[track]
      );

      return;
    }
  }

  trackLayout.setAttribute(
    'd',
    'M180 300 C250 120 750 120 820 300 C750 480 250 480 180 300'
  );
}

async function loadFullDashboard(
  session
) {

  try {

    currentSession = session;

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

  } catch (error) {

    console.log(error);

    timingTower.innerHTML =
      'Dashboard Loading Failed';
  }
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
          ${driver.full_name || 'Unknown'}
        </div>
      </div>

      <div class="focus-card">
        <div class="focus-card-title">
          Team
        </div>

        <div class="focus-card-value">
          ${driver.team_name || 'Unknown'}
        </div>
      </div>

      <div class="focus-card">
        <div class="focus-card-title">
          Position
        </div>

        <div class="focus-card-value">
          P${position.position || '-'}
        </div>
      </div>

      <div class="focus-card">
        <div class="focus-card-title">
          Number
        </div>

        <div class="focus-card-value">
          #${driver.driver_number || '-'}
        </div>
      </div>

    </div>
  `;
}

async function loadWidgets() {

  if (!currentSession) return;

  try {

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

  } catch {

    weatherWidget.innerHTML =
      'Weather Failed';
  }

  try {

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

  } catch {

    raceControlWidget.innerHTML =
      'Race Control Failed';
  }

  try {

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

  } catch {

    radioWidget.innerHTML =
      'Radio Failed';
  }

  try {

    const laps =
      await getLaps(
        currentSession.session_key
      );

    fastestLapWidget.innerHTML =
      laps.length
        ? 'Lap Data Loaded'
        : 'No Lap Data';

  } catch {

    fastestLapWidget.innerHTML =
      'Fastest Lap Failed';
  }
}

seasonSelector.onchange =
  async () => {

    await populateEvents(
      seasonSelector.value
    );
  };

loadSessionBtn.onclick =
  async () => {

    try {

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

      currentSession = session;

      sessionName.innerHTML =
        (session.meeting_name || 'Unknown Event') +
        ' - ' +
        (session.session_name || 'Unknown Session');

      populateTrack();

      await loadFullDashboard(
        session
      );

    } catch (error) {

      console.log(error);
    }
  };

initialize();