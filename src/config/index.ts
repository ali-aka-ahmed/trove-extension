/**
 * Remember to logout before changing this!
 *
 * Test with DEV. Change to PROD only right before you deploy. LOCAL is available just in case 
 * you are working across the extension and backend at the same time.
 */
export enum Environments {
  PRODUCTION,
  DEVELOPMENT,
  LOCAL
}

export enum BackendURLs {
  PRODUCTION = 'https://api.trove.so',
  DEVELOPMENT = 'https://dev.trove.so',
  LOCAL = 'http://localhost:5000',
}

export enum WebsiteOrigins {
  PRODUCTION = 'https://www.trove.so',
  DEVELOPMENT = 'https://development.trove.so',
  DEMO = 'https://demo.trove.so',
  LOCAL = 'http://localhost:3000',
}

/**
 * SET THESE 👇
 */
export const FRONTEND: Environments = Environments.LOCAL
export const BACKEND: Environments = Environments.LOCAL

export const LOGGING: boolean = true;

export let BACKEND_URL: BackendURLs;
export let ORIGIN: WebsiteOrigins;

//@ts-ignore
if (FRONTEND === Environments.PRODUCTION) {
  ORIGIN = WebsiteOrigins.PRODUCTION;
//@ts-ignore
} else if (FRONTEND === Environments.DEVELOPMENT) {
  ORIGIN = WebsiteOrigins.DEVELOPMENT;
//@ts-ignore
} else if (FRONTEND === Environments.LOCAL) {
  ORIGIN = WebsiteOrigins.LOCAL;
}

//@ts-ignore
if (BACKEND === Environments.PRODUCTION) {
  BACKEND_URL = BackendURLs.PRODUCTION;
//@ts-ignore
} else if (BACKEND === Environments.DEVELOPMENT) {
  BACKEND_URL = BackendURLs.DEVELOPMENT;
//@ts-ignore
} else if (BACKEND === Environments.LOCAL) {
  BACKEND_URL = BackendURLs.LOCAL;
}

export const VALID_DOMAINS = [
  'www.trove.so',
  'development.trove.so',
  'demo.trove.so',
  'localhost',
]
