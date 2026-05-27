const API =
'https://api.openf1.org/v1';

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

const TEAM_COLORS = {

  'Red Bull Racing':'#1E5BC6',
  'Ferrari':'#DC0000',
  'Mercedes':'#00D2BE',
  'McLaren':'#FF8700',
  'Aston Martin':'#006F62',
  'Alpine':'#0090FF',
  'Williams':'#005AFF',
  'RB':'#6692FF',
  'Kick Sauber':'#52E252',
  'Haas F1 Team':'#FFFFFF'
};

let currentSession = null;

let drivers = [];

let positions = [];

async function initialize(){

  try{

    sessionName.innerHTML =
    'Loading Live Session...';

    const sessionResponse =
    await fetch(`${API}/sessions`);

    const sessions =
    await sessionResponse.json();

    if(!sessions.length){

      sessionName.innerHTML =
      'No Session Found';

      return;
    }

    currentSession =
    sessions[sessions.length - 1];

    sessionName.innerHTML =

      (currentSession.meeting_name || 'Unknown Event')

      +

      ' - '

      +

      (currentSession.session_name || 'Unknown Session');

    renderTrack();

    await Promise.all([

      loadTimingTower(),
      loadWeather(),
      loadRaceControl(),
      loadRadio(),
      loadFastestLap()

    ]);

  }

  catch(error){

    console.log(error);

    sessionName.innerHTML =
    'Dashboard Failed';
  }
}

function renderTrack(){

  trackLayout.setAttribute(

    'd',

    'M180 300 C250 120 750 120 820 300 C750 480 250 480 180 300'
  );
}

async function loadTimingTower(){

  try{

    const driverResponse =

    await fetch(

      `${API}/drivers?session_key=${currentSession.session_key}`
    );

    drivers =
    await driverResponse.json();

    const positionResponse =

    await fetch(

      `${API}/position?session_key=${currentSession.session_key}`
    );

    positions =
    await positionResponse.json();

    if(!drivers.length){

      timingTower.innerHTML =
      'No Timing Data';

      return;
    }

    renderTimingTower();
    renderTrackDots();

  }

  catch(error){

    console.log(error);

    timingTower.innerHTML =
    'Timing Failed';
  }
}

function renderTimingTower(){

  timingTower.innerHTML = '';

  const latestPositions = {};

  positions.forEach(position=>{

    latestPositions[
      position.driver_number
    ] = position;
  });

  const sorted =

  Object.values(latestPositions)

  .sort((a,b)=>

    a.position - b.position
  );

  sorted.forEach((position,index)=>{

    const driver =

    drivers.find(

      d=>

      d.driver_number ===
      position.driver_number
    );

    if(!driver) return;

    const row =
    document.createElement('div');

    row.className =
    'driver-row';

    row.style.borderLeft =

    `4px solid ${

      TEAM_COLORS[
        driver.team_name
      ] || '#00D2BE'

    }`;

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

            ?

            'LEADER'

            :

            '+' + (index * 1.2).toFixed(1)

          }

        </div>

        <div>

          RUN

        </div>

      </div>
    `;

    row.onclick = ()=>{

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
){

  driverFocusPanel.innerHTML = `

    <div class="focus-card">

      <b>Driver:</b>

      ${driver.full_name}

      <br><br>

      <b>Team:</b>

      ${driver.team_name}

      <br><br>

      <b>Position:</b>

      P${position.position}

      <br><br>

      <b>Number:</b>

      #${driver.driver_number}

    </div>
  `;
}

function renderTrackDots(){

  document

  .querySelectorAll('.driver-dot')

  .forEach(dot=>dot.remove());

  const latestPositions = {};

  positions.forEach(position=>{

    latestPositions[
      position.driver_number
    ] = position;
  });

  const sorted =

  Object.values(latestPositions)

  .sort((a,b)=>

    a.position - b.position
  );

  sorted.forEach((position,index)=>{

    const driver =

    drivers.find(

      d=>

      d.driver_number ===
      position.driver_number
    );

    if(!driver) return;

    const progress =
    index / sorted.length;

    const x =
    180 + progress * 620;

    const y =

    300 +

    Math.sin(

      progress * Math.PI * 2

    ) * 140;

    const dot =

    document.createElementNS(

      'http://www.w3.org/2000/svg',

      'circle'
    );

    dot.setAttribute('cx',x);
    dot.setAttribute('cy',y);

    dot.setAttribute('r',8);

    dot.setAttribute(

      'fill',

      TEAM_COLORS[
        driver.team_name
      ] || '#00D2BE'
    );

    dot.setAttribute(
      'class',
      'driver-dot'
    );

    trackMap.appendChild(dot);
  });
}

async function loadWeather(){

  try{

    const response =

    await fetch(

      `${API}/weather?session_key=${currentSession.session_key}`
    );

    const weather =
    await response.json();

    if(!weather.length){

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
  }

  catch(error){

    weatherWidget.innerHTML =
    'Weather Failed';
  }
}

async function loadRaceControl(){

  try{

    const response =

    await fetch(

      `${API}/race_control?session_key=${currentSession.session_key}`
    );

    const data =
    await response.json();

    if(!data.length){

      raceControlWidget.innerHTML =
      'No Race Control Data';

      return;
    }

    raceControlWidget.innerHTML =

    data

    .slice(-5)

    .map(item=>item.message)

    .join('<br><br>');
  }

  catch(error){

    raceControlWidget.innerHTML =
    'Race Control Failed';
  }
}

async function loadRadio(){

  try{

    const response =

    await fetch(

      `${API}/team_radio?session_key=${currentSession.session_key}`
    );

    const data =
    await response.json();

    if(!data.length){

      radioWidget.innerHTML =
      'No Team Radio';

      return;
    }

    radioWidget.innerHTML =

    data

    .slice(-5)

    .map(item=>

      'Driver #' +

      item.driver_number
    )

    .join('<br><br>');
  }

  catch(error){

    radioWidget.innerHTML =
    'Radio Failed';
  }
}

async function loadFastestLap(){

  try{

    const response =

    await fetch(

      `${API}/laps?session_key=${currentSession.session_key}`
    );

    const laps =
    await response.json();

    if(!laps.length){

      fastestLapWidget.innerHTML =
      'No Lap Data';

      return;
    }

    fastestLapWidget.innerHTML =

      'Lap Data Loaded';
  }

  catch(error){

    fastestLapWidget.innerHTML =
    'Fastest Lap Failed';
  }
}

initialize();