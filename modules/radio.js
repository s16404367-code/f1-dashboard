export function renderRadio(
  container,
  radio,
  selectedDriver
) {

  if (!radio.length) {

    container.innerHTML =
      'No Team Radio';

    return;
  }

  let filtered = radio;

  if (selectedDriver) {

    filtered =
      radio.filter(item =>

        item.driver_number ===
        selectedDriver.driver_number
      );
  }

  container.innerHTML =
    filtered
      .slice(-8)
      .reverse()
      .map(item => `

        <div class="radio-item">

          Driver #${item.driver_number}

          <br><br>

          ${item.date}

        </div>

      `)
      .join('');
}