export function calculateIntervals(
  sortedPositions
) {

  return sortedPositions.map(
    (position, index) => {

      return {

        driver_number:
          position.driver_number,

        interval:
          index === 0
            ? 'LEADER'
            : '+' + (index * 1.2).toFixed(1)
      };
    }
  );
}