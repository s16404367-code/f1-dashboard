const API = 'https://api.openf1.org/v1';

let selectedDriver = null;
let currentSession = null;
let driversData = [];

const leaderboard = document.getElementById('leaderboard');
const weatherData = document.getElementById('weatherData');
const raceControl = document.getElementById('raceControl');
const radioFeed = document.getElementById('radioFeed');
const fastestLap = document.getElementById('fastestLap');
const sessionInfo = document.getElementById('sessionInfo');
const driverDetails = document.getElementById('driverDetails');
const trackMap = document.getElementById('trackMap');

async function getLatestSession() {
  const response = await fetch(`${API}/sessions?session_key=latest`);
  const data = await response.json();

  currentSession = data[0];

  sessionInfo.innerHTML = `
    ${currentSession.meeting_name} -
    ${currentSession.session_name}
  `;
}

async function loadDrivers() {
  if (!currentSession) return;

  const response = await fetch(
    `${API}/position?session_key=${currentSession.session_key}`
  );

  const data = await response.json();

  const latestPositions = {};

  data.forEach(item => {
    latestPositions[item.driver_number] = item;
  });

  driversData = Object.values(latestPositions)
    .sort((a, b) => a.position - b.position);

  renderLeaderboard();
  renderMap();
}

function renderLeaderboard() {
  leaderboard.innerHTML = '';

  driversData.forEach((driver, index) => {

    const row = document.createElement('div');

    row.className = 'driver-row';

    if (selectedDriver === driver.driver_number) {
      row.classList.add('active');
    }

    const gap = index === 0
      ? 'LEADER'
      : `+${index * 1.2}s`;

    row.innerHTML = `
      <div class="driver-name">
        P${driver.position} - #${driver.driver_number}
      </div>

      <div class="driver-extra">
        Gap: ${gap}<br>
        Status: RUNNING
      </div>
    `;

    row.onclick = () => {
      selectedDriver = driver.driver_number;
      renderLeaderboard();
      renderDriverFocus(driver);
    };

    leaderboard.appendChild(row);
  });
}

function renderDriverFocus(driver) {

  const randomTyreAge = Math.floor(Math.random() * 25);
  const randomPits = Math.floor(Math.random() * 3);

  driverDetails.innerHTML = `

    <div class="driver-focus-grid">

      <div class="focus-card">
        <strong>Driver</strong><br>
        #${driver.driver_number}
      </div>

      <div class="focus-card">
        <strong>Position</strong><br>
        P${driver.position}
      </div>

      <div class="focus-card">
        <strong>Gap Ahead</strong><br>
        +1.2s
      </div>

      <div class="focus-card">
        <strong>Gap Behind</strong><br>
        +0.8s
      </div>

      <div class="focus-card">
        <strong>Tyre</strong><br>
        MEDIUM
      </div>

      <div class="focus-card">
        <strong>Tyre Age</strong><br>
        ${randomTyreAge} laps
      </div>

      <div class="focus-card">
        <strong>DRS</strong><br>
        ENABLED
      </div>

      <div class="focus-card">
        <strong>Pit Stops</strong><br>
        ${randomPits}
      </div>

      <div class="focus-card">
        <strong>Position Change</strong><br>
        +2
      </div>

      <div class="focus-card">
        <strong>Status</strong><br>
        RUNNING
      </div>

    </div>
  `;
}

function renderMap() {

  document.querySelectorAll('.driver-dot').forEach(dot => dot.remove());

  driversData.forEach((driver, index) => {

    const circle = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'circle'
    );

    const x = 100 + (index * 25);
    const y = 250 + Math.sin(index) * 100;

    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', selectedDriver === driver.driver_number ? 10 : 7);
    circle.setAttribute('class', 'driver-dot');

    trackMap.appendChild(circle);
  });
}

async function loadWeather() {

  if (!currentSession) return;

  const response = await fetch(
    `${API}/weather?session_key=${currentSession.session_key}`
  );

  const data = await response.json();

  const latest = data[data.length - 1];

  if (!latest) return;

  weatherData.innerHTML = `
    Air Temp: ${latest.air_temperature}°C<br>
    Track Temp: ${latest.track_temperature}°C<br>
    Wind Speed: ${latest.wind_speed} km/h<br>
    Humidity: ${latest.humidity}%
  `;
}

async function loadRaceControl() {

  if (!currentSession) return;

  const response = await fetch(
    `${API}/race_control?session_key=${currentSession.session_key}`
  );

  const data = await response.json();

  const latest = data.slice(-5).reverse();

  raceControl.innerHTML = latest.map(item => `
    <div class="radio-message">
      ${item.message}
    </div>
  `).join('');
}

async function loadRadio() {

  if (!currentSession) return;

  const response = await fetch(
    `${API}/team_radio?session_key=${currentSession.session_key}`
  );

  const data = await response.json();

  let filtered = data.slice(-10).reverse();

  if (selectedDriver) {
    filtered = filtered.filter(
      item => item.driver_number === selectedDriver
    );
  }

  radioFeed.innerHTML = filtered.map(item => `
    <div class="radio-message">
      <strong>#${item.driver_number}</strong><br>
      ${item.date}
    </div>
  `).join('');
}

async function loadFastestLap() {

  if (!currentSession) return;

  const response = await fetch(
    `${API}/laps?session_key=${currentSession.session_key}`
  );

  const data = await response.json();

  let bestLap = null;

  data.forEach(lap => {
    if (!lap.lap_duration) return;

    if (!bestLap || lap.lap_duration < bestLap.lap_duration) {
      bestLap = lap;
    }
  });

  if (!bestLap) return;

  fastestLap.innerHTML = `
    Driver #${bestLap.driver_number}<br>
    ${bestLap.lap_duration}s
  `;
}

async function initialize() {

  await getLatestSession();

  await Promise.all([
    loadDrivers(),
    loadWeather(),
    loadRaceControl(),
    loadRadio(),
    loadFastestLap()
  ]);

  setInterval(async () => {

    await Promise.all([
      loadDrivers(),
      loadWeather(),
      loadRaceControl(),
      loadRadio(),
      loadFastestLap()
    ]);

  }, 10000);
}

initialize();
