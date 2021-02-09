import { LOGGING } from '../config';

/**
 * Wrap input in array if it isn't already an array.
 * @param input
 */
export function toArray<T>(input: T | T[]): T[] {
  if (input == null) return []; // Catch undefined and null values
  return input instanceof Array ? input : [input];
}

/**
 * Log args when not in production.
 * @param args
 */
export function log(...args: any[]): void {
  if (LOGGING) console.info.apply(console, args);
}

/**
 * Converts Hex to RGBA.
 * @param {string} hex
 * @param {number} opacity
 * @returns {string|null}
 */
export const hexToRgba = (hex: string, opacity: number): string | null => {
  let c: string[];
  let hexCode: number;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('');
    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    hexCode = parseInt('0x' + c.join(''));
    return `rgba(${[(hexCode >> 16) & 255, (hexCode >> 8) & 255, hexCode & 255].join(
      ',',
    )}, ${opacity.toString()})`;
  }
  return null;
};
