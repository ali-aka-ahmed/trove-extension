/**
 * Wrap input in array if it isn't already an array.
 * @param input
 */
export function toArray<T>(input: T | T[]): T[] {
  if (input == null) return []; // Catch undefined and null values
  return (input instanceof Array) ? input : [input];
}

/**
 * Calculates relative time for display.
 * @param datetime 
 * @returns {string}
 */
export const displayRelativeTime = (datetime: number): string => {
  const deltaMs = Date.now() - datetime;
  const deltaS = Math.round(deltaMs / 1000);
  const deltaMins = Math.round(deltaMs / 1000 / 60);
  const deltaHrs = Math.round(deltaMs / 1000 / 60 / 60);
  const deltaDate = new Date(datetime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  if (deltaS < 60) return `${deltaS.toString()}s`;
  else if (deltaMins < 60) return `${deltaMins.toString()}m`;
  else if (deltaHrs < 24) return `${deltaHrs.toString()}h`;
  else return deltaDate;
};