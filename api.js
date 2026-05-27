const OPENF1 = 'https://api.openf1.org/v1';

export async function getLatestSession() {

  try {

    const response = await fetch(
      `${OPENF1}/sessions?session_key=latest`
    );

    const data = await response.json();

    return data[0];

  } catch (error) {

    console.log(error);

    return null;
  }
}

export async function getDrivers(sessionKey) {

  try {

    const response = await fetch(
      `${OPENF1}/drivers?session_key=${sessionKey}`
    );

    return await response.json();

  } catch (error) {

    console.log(error);

    return [];
  }
}

export async function getPositions(sessionKey) {

  try {

    const response = await fetch(
      `${OPENF1}/position?session_key=${sessionKey}`
    );

    return await response.json();

  } catch (error) {

    console.log(error);

    return [];
  }
}

export async function getWeather(sessionKey) {

  try {

    const response = await fetch(
      `${OPENF1}/weather?session_key=${sessionKey}`
    );

    return await response.json();

  } catch (error) {

    console.log(error);

    return [];
  }
}

export async function getRadio(sessionKey) {

  try {

    const response = await fetch(
      `${OPENF1}/team_radio?session_key=${sessionKey}`
    );

    return await response.json();

  } catch (error) {

    console.log(error);

    return [];
  }
}

export async function getRaceControl(sessionKey) {

  try {

    const response = await fetch(
      `${OPENF1}/race_control?session_key=${sessionKey}`
    );

    return await response.json();

  } catch (error) {

    console.log(error);

    return [];
  }
}

export async function getLaps(sessionKey) {

  try {

    const response = await fetch(
      `${OPENF1}/laps?session_key=${sessionKey}`
    );

    return await response.json();

  } catch (error) {

    console.log(error);

    return [];
  }
}