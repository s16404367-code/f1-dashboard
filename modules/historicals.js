const JOLPICA =
  'https://api.jolpi.ca/ergast/f1';

export async function getSeasonRaces(
  season
) {

  try {

    const response = await fetch(
      `${JOLPICA}/${season}.json`
    );

    const data = await response.json();

    return data.MRData.RaceTable.Races;

  } catch (error) {

    console.log(error);

    return [];
  }
}