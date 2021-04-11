/**
 * Remember to logout before changing this!
 *
 * Test with DEV and LOCAL.
 * you are working across the extension and backend at the same time.
 */
export enum Environments {
  PRODUCTION = 'Production',
  DEVELOPMENT = 'Development',
  LOCAL = 'Local',
}

export enum BackendURLs {
  DEVELOPMENT = 'https://dev.trove.so',
  LOCAL = 'http://localhost:5000',
}

export enum WebsiteOrigins {
  DEVELOPMENT = 'https://development.trove.so',
  DEMO = 'https://demo.trove.so',
  LOCAL = 'http://localhost:3000',
}

/**
 * SET THESE 👇
 */
export const ENVIRONMENT: Environments = Environments.LOCAL;
export const FRONTEND: Environments = Environments.LOCAL;
export const BACKEND: Environments = Environments.LOCAL;
export const LOGGING: boolean = true;

export let BACKEND_URL: BackendURLs;
export let ORIGIN: WebsiteOrigins;

//@ts-ignore
if (FRONTEND === Environments.DEVELOPMENT) {
  ORIGIN = WebsiteOrigins.DEVELOPMENT;
  //@ts-ignore
} else if (FRONTEND === Environments.LOCAL) {
  ORIGIN = WebsiteOrigins.LOCAL;
}

//@ts-ignore
if (BACKEND === Environments.DEVELOPMENT) {
  BACKEND_URL = BackendURLs.DEVELOPMENT;
  //@ts-ignore
} else if (BACKEND === Environments.LOCAL) {
  BACKEND_URL = BackendURLs.LOCAL;
}

export const VALID_DOMAINS = ['development.trove.so', 'demo.trove.so', 'localhost'];
