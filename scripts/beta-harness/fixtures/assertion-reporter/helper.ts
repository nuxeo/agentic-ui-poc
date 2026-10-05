/** Stands in for a fixture or shared helper: a failure here never reached the spec body. */
export function throwFromAnotherFile(): never {
  throw new Error('simulated fixture failure, thrown outside any spec file');
}
