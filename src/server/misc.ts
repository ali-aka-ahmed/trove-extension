import { api, AxiosRes } from '.';
import IExtensionError from '../models/IExtensionError';

export const createErrorReport = async (args: ErrorReqBody): Promise<AxiosRes> => {
  return await api.post('/error', args);
}

/**
 * POST /error
 */
export interface ErrorReqBody {
  origin: ErrorOrigin;
  message: string;
  error: IExtensionError | Error;
  componentStack: string;
  userId?: string;
  url?: string;
}

export enum ErrorOrigin {
  Backend = 'Backend',
  Frontend = 'Frontend',
  ContentScript = 'ContentScript',
  Popup = 'Popup',
}
