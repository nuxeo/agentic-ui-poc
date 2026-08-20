/**
 * Application-driven token supply. The adapter asks the application for an access
 * token; acquisition, refresh and the 401 path stay in the application's auth layer
 * and never reach the port taxonomy unless refresh has failed.
 */
export interface AuthPort {
  getAccessToken(): Promise<string>;
}
