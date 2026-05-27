const OPENF1 = 'https://api.openf1.org/v1';

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

const TEAM_COLORS = {

  "Red Bull": "#1E5BC6",
  "Ferrari": "#DC0000",
  "Mercedes": "#00D2BE",
  "McLaren": "#FF8700",
  "Aston Martin": "#006F62",
  "Alpine": "#0090FF",
  "Williams": "#005AFF",
  "RB": "#6692FF",
  "Kick Sauber": "#52E252",
  "Haas": "#FFFFFF"
};

const TRACKS = {

  "Bahrain":
    "M180 300 L300 120 L700 120 L820 300 L700 480 L300 480 Z",

  "Monaco":
    "M220 300 C220 120 650 120 700 260 C720 420 320 500 220 300",

  "Silverstone":
    "M100 300 L240 120 L700 120 L850 300 L700 480 L240 480 Z",

  "Spa":
    "M120 340 C200 100 720 100 860 320 C720 520 240 520 120 340",

  "Monza":
    "M220 140 L760 140 L860 300 L760 460 L220 460 L120 300 Z",

  "Singapore":
    "M150 300 C250 80 700 80 820 300 C700 520 250 520 150 300"
};

async function initialize() {

  try {

    const sessionResponse =
      await fetch(`${OPENF1}/sessions`);

    const sessions =
      await sessionResponse.json();

    if (!sessions.length) {

      sessionName.innerHTML =
        'No Session Found';

      return;
    }

    currentSession =
      sessions[sessions.length - 1];

    sessionName.innerHTML =
      currentSession.meeting_name +
      ' - ' +
      currentSession.session_name;

    populateTrack();

    await loadDrivers();

    await loadWeather();

    await loadRaceControl();

    await loadRadio();

    await loadFastestLap();

  } catch (error) {

    console.log(error);

    sessionName.innerHTML =
      'Dashboard Failed To Load';
  }
}

function populateTrack() {

  const name =
    currentSession.meeting_name;

  for (const track in TRACKS) {

    if (name.includes(track)) {

      trackLayout.setAttribute(
        'd',
        TRACKS[track]
      );

      return;
    }
  }

  trackLayout.setAttribute(
    'd',
    'M150 300 C250 100 700 100 820 300'
  );
}

async function loadDrivers() {

  try {

    const driverResponse =
      await fetch(
        `${OPENF1}/drivers?session_key=${currentSession.session_key}`
      );

    drivers =
      await driverResponse.json();

    const positionResponse =
      await fetch(
        `${OPENF1}/position?session_key=${currentSession.session_key}`
      );

    positions =
      await positionResponse.json();

    renderTimingTower();

    renderTrackDots();

  } catch (error) {

    console.log(error);

    timingTower.innerHTML =
      'Timing Data Failed';
  }
}

function renderTimingTower() {

  timingTower.innerHTML = '';

  const latestPositions = {};

  positions.forEach(position => {

    latestPositions[
      position.driver_number
    ] = position;
  });

  const sorted =
    Object.values(latestPositions)
      .sort((a, b) =>
        a.position - b.position
      );

  sorted.forEach((position, index) => {

    const driver =
      drivers.find(d =>
        d.driver_number ===
        position.driver_number
      );

    if (!driver) return;

    const row =
      document.createElement('div');

    row.className =
      'driver-row';

    const teamColor =
      TEAM_COLORS[
        driver.team_name
      ] || '#00D2BE';

    row.style.borderLeft =
      `4px solid ${teamColor}`;

    row.innerHTML = `

      <div class="driver-top">

        <div>

          <div class="driver-name">

            P${position.position}
            ${driver.name_acronym}

          </div>

          <div class="team-name">

            ${driver.team_name}

          </div>

        </div>

        <div>

          #${driver.driver_number}

        </div>

      </div>

      <div class="driver-extra">

        <div>

          ${
            index === 0
              ? 'LEADER'
              : '+' + (index * 1.2).toFixed(1)
          }

        </div>

        <div>

          RUN

        </div>

      </div>
    `;

    row.onclick = () => {

      selectedDriver = driver;

      renderDriverFocus(
        driver,
        position
      );
    };

    timingTower.appendChild(row);
  });
}

function renderDriverFocus(
  driver,
  position
) {

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

    </div>
  `;
}

function renderTrackDots() {

  document
    .querySelectorAll('.driver-dot')
    .forEach(dot => dot.remove());

  const latestPositions = {};

  positions.forEach(position => {

    latestPositions[
      position.driver_number
    ] = position;
  });

  const sorted =
    Object.values(latestPositions)
      .sort((a, b) =>
        a.position - b.position
      );

  sorted.forEach((position, index) => {

    const driver =
      drivers.find(d =>
        d.driver_number ===
        position.driver_number
      );

    if (!driver) return;

    const progress =
      index / sorted.length;

    const x =
      180 + progress * 600;

    const y =
      300 +
      Math.sin(progress * Math.PI * 2) * 140;

    const circle =
      document.createElementNS(
        'http://www.w3.org/2000/svg',
        'circle'
      );

    circle.setAttribute('cx', x);

    circle.setAttribute('cy', y);

    circle.setAttribute('r', 8);

    circle.setAttribute(
      'fill',
      TEAM_COLORS[
        driver.team_name
      ] || '#00D2BE'
    );

    circle.setAttribute(
      'class',
      'driver-dot'
    );

    trackMap.appendChild(circle);
  });
}

async function loadWeather() {

  try {

    const response =
      await fetch(
        `${OPENF1}/weather?session_key=${currentSession.session_key}`
      );

    const weather =
      await response.json();

    if (!weather.length) {

      weatherWidget.innerHTML =
        'No Weather Data';

      return;
    }

    const latest =
      weather[weather.length - 1];

    weatherWidget.innerHTML = `

      Air Temp:
      ${latest.air_temperature}°C

      <br><br>

      Track Temp:
      ${latest.track_temperature}°C

      <br><br>

      Humidity:
      ${latest.humidity}%
    `;

  } catch (error) {

    weatherWidget.innerHTML =
      'Weather Failed';
  }
}

async function loadRaceControl() {

  try {

    const response =
      await fetch(
        `${OPENF1}/race_control?session_key=${currentSession.session_key}`
      );

    const data =
      await response.json();

    if (!data.length) {

      raceControlWidget.innerHTML =
        'No Race Control Data';

      return;
    }

    raceControlWidget.innerHTML =
      data
        .slice(-5)
        .map(item =>
          item.message
        )
        .join('<br><br>');

  } catch (error) {

    raceControlWidget.innerHTML =
      'Race Control Failed';
  }
}

async function loadRadio() {

  try {

    const response =
      await fetch(
        `${OPENF1}/team_radio?session_key=${currentSession.session_key}`
      );

    const data =
      await response.json();

    if (!data.length) {

      radioWidget.innerHTML =
        'No Team Radio';

      return;
    }

    radioWidget.innerHTML =
      data
        .slice(-5)
        .map(item =>

          'Driver #' +
          item.driver_number

        )
        .join('<br><br>');

  } catch (error) {

    radioWidget.innerHTML =
      'Radio Failed';
  }
}

async function loadFastestLap() {

  try {

    const response =
      await fetch(
        `${OPENF1}/laps?session_key=${currentSession.session_key}`
      );

    const laps =
      await response.json();

    if (!laps.length) {

      fastestLapWidget.innerHTML =
        'No Lap Data';

      return;
    }

    fastestLapWidget.innerHTML =
      'Lap Data Loaded';

  } catch (error) {

    fastestLapWidget.innerHTML =
      'Fastest Lap Failed';
  }
}

initialize();
