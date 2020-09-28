/**
 * Base response object.
 * If status is NOT successful (200 - 299), then errorMessage appears.
 * @interface BaseRes
 */
export interface BaseRes {
  message?: string;
}

/**
 * Base response object. Copy of core.ParamsDictionary in express.
 * @interface BaseParams
 */
export interface BaseParams {
  [key: string]: string;
}
