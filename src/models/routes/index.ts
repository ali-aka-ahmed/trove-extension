/**
 * Base response object.
 * If status is NOT successful (200 - 299), then message appears.
 */
export interface BaseRes {
  message?: string;
}

/**
 * Base response object. Copy of core.ParamsDictionary in express.
 */
export interface BaseParams {
  [key: string]: string;
}
