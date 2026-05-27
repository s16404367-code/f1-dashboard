import {
  tracks,
  teams
} from './config.js';

export function renderTrack(trackElement, eventName) {

  for (const track in tracks) {

    if (eventName.includes(track)) {

      trackElement.setAttribute(
        'd',
        tracks[track].svg
      );

      return;
    }
  }

  trackElement.setAttribute(
    'd',
    'M150 300 C250 100 700 100 820 300'
  );
}

export function renderDriverDots(
  svg,
  drivers,
  positions,
  selectedDriver
) {

  document
    .querySelectorAll('.driver-dot, .driver-label')
    .forEach(item => item.remove());

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

    const progress = index / sorted.length;

    const x = 180 + progress * 600;
    const y =
      300 +
      Math.sin(progress * Math.PI * 2) * 140;

    const circle = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'circle'
    );

    const teamColor =
      teams[driver.team_name]?.color || '#00D2BE';

    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);

    circle.setAttribute(
      'r',
      selectedDriver &&
      selectedDriver.driver_number === driver.driver_number
        ? 11
        : 8
    );

    circle.setAttribute('fill', teamColor);

    circle.setAttribute(
      'class',
      'driver-dot'
    );

    svg.appendChild(circle);

    const label = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'text'
    );

    label.setAttribute('x', x + 14);
    label.setAttribute('y', y + 4);

    label.setAttribute('fill', 'white');

    label.setAttribute(
      'class',
      'driver-label'
    );

    label.textContent =
      driver.name_acronym;

    svg.appendChild(label);
  });
}