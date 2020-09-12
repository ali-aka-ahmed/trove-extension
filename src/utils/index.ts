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

/** VALIDATION FOR USER INFORMATION */

export const validateUsername = (username: string): { success: boolean, message?: string } => {
  if (username.length === 0) {
    return {
      success: false,
      message: 'Please enter a username!'
    }
  } else if (username.includes(' ')) {
    return {
      success: false,
      message: 'Username cannot have spaces. Try using a dash!'
    }
  } else if (username.length < 3) {
    return {
      success: false,
      message: 'Your username must be at least 3 characters long!'
    }
  } else if (username.length > 20) {
    return {
      success: false,
      message: 'Your username must be less than 20 characters!'
    }
  } else return { success : true }
  // TODO add restricted usernames (server-side).
  // TODO add check for username already taken (server-side).
}

export const validateDisplayName = (name: string): { success: boolean, message?: string } => {
  if (name.length === 0) {
    return {
      success: false,
      message: 'Please enter a name!'
    }
  }
  return { success: true };
};