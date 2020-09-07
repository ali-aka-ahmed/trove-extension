/**
 * Checks if entered value is a valid 6 digit hex
 * @param {string} value 
 * @returns {boolean}
 */
export const isHexValid = (value: string): boolean => {
  return /^#([A-Fa-f0-9]{6}$)/.test(value)
}