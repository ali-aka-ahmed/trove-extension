export const validateUsername = (username: string): { success: boolean, message?: string } => {
  if (username.length === 0) {
    return {
      success: false,
      message: 'Please enter a username!'
    };
  } else if (username.includes(' ')) {
    return {
      success: false,
      message: 'Username cannot have spaces. Try using a dash!'
    };
  } else if (username.length < 3) {
    return {
      success: false,
      message: 'Your username must be at least 3 characters long!'
    };
  } else if (username.length > 20) {
    return {
      success: false,
      message: 'Your username must be less than 20 characters!'
    };
  } else return { success : true };
  // TODO add restricted usernames (server-side).
  // TODO add check for username already taken (server-side).
}

export const validateDisplayName = (name: string): { success: boolean, message?: string } => {
  if (name.length === 0) {
    return {
      success: false,
      message: 'Please enter a name!'
    };
  }
  
  return { success: true };
};
