import { HttpContextToken } from '@angular/common/http';

/** When true, send cookies on a Basic-auth request to establish a Nuxeo browser session. */
export const NUXEO_ESTABLISH_BROWSER_SESSION = new HttpContextToken<boolean>(() => false);

/** When true, omit browser cookies even for share-token or cookie-session requests. */
export const NUXEO_OMIT_BROWSER_CREDENTIALS = new HttpContextToken<boolean>(() => false);
