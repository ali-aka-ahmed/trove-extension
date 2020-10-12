import { LoginReqBody } from '../../../server/auth';

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
}

export const validateDisplayName = (name: string): { success: boolean, message?: string } => {
  if (name.length === 0) {
    return {
      success: false,
      message: 'Please enter a name!'
    };
  } else return { success: true };
};

export const createLoginArgs = (loginParam: string, password: string): LoginReqBody => {
  const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
  const phoneNumberRegex = /(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})/;
  if (emailRegex.test(loginParam)) return { email: loginParam, password };
  if (phoneNumberRegex.test(loginParam)) return { phoneNumber: loginParam, password };
  else return { username: loginParam, password };
}