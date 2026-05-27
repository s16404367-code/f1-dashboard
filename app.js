const sessionName =
document.getElementById('sessionName');

const trackLayout =
document.getElementById('trackLayout');

async function initialize() {

  try {

    sessionName.innerHTML =
      'Professional Dashboard Running';

    populateTrack();

  } catch(error) {

    console.log(error);

    sessionName.innerHTML =
      'Dashboard Failed';
  }
}

function populateTrack() {

  trackLayout.setAttribute(
    'd',
    'M180 300 C250 120 750 120 820 300 C750 480 250 480 180 300'
  );
}

initialize();