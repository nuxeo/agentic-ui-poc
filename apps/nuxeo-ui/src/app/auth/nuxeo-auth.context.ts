import { HttpContextToken } from '@angular/common/http';

/** When true, send cookies on a Basic-auth request to establish a Nuxeo browser session. */
export const NUXEO_ESTABLISH_BROWSER_SESSION = new HttpContextToken<boolean>(() => false);

/** When true, omit browser credentials even for cookie-based Nuxeo sessions. */
export const NUXEO_OMIT_CREDENTIALS = new HttpContextToken<boolean>(() => false);
