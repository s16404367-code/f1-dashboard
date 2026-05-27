import { teams } from './config.js';

export function renderTimingTower(
  container,
  drivers,
  positions,
  selectedDriver,
  onSelectDriver
) {

  container.innerHTML = '';

  const latestPositions = {};

  positions.forEach(position => {
    latestPositions[position.driver_number] = position;
  });

  const sorted = Object.values(latestPositions)
    .sort((a, b) => a.position - b.position);

  sorted.forEach((position, index) => {

    const driver = drivers.find(
      d => d.driver_number === position.driver_number
    );

    if (!driver) return;

    const row = document.createElement('div');

    row.className = 'driver-row';

    if (
      selectedDriver &&
      selectedDriver.driver_number === driver.driver_number
    ) {
      row.classList.add('active');
    }

    const teamColor =
      teams[driver.team_name]?.color || '#00D2BE';

    const interval =
      index === 0
        ? 'LEADER'
        : '+' + (index * 1.2).toFixed(1);

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
          ${driver.driver_number}
        </div>

      </div>

      <div class="driver-extra">

        <div>
          Gap ${interval}
        </div>

        <div>
          RUN
        </div>

      </div>
    `;

    row.onclick = () => {
      onSelectDriver(driver, position);
    };

    container.appendChild(row);
  });
}