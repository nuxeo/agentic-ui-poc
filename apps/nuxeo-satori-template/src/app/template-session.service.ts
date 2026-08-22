import { Injectable, signal } from '@angular/core';

/**
 * A stand-in for whatever a fork uses to know who is signed in.
 *
 * Deliberately trivial and deliberately **not** a real authentication service.
 * It exists so `template.rules.isSignedIn` has something to close over, which is
 * the point the template is making: a Layer 2 rule is ordinary Angular code with
 * ordinary dependencies, not a restricted expression language.
 *
 * A fork replaces this with its own auth service. Nothing in
 * `@nuxeo-satori/platform` depends on this type.
 */
@Injectable({ providedIn: 'root' })
export class TemplateSessionService {
  private readonly signedIn = signal(true);

  isSignedIn(): boolean {
    return this.signedIn();
  }

  setSignedIn(value: boolean): void {
    this.signedIn.set(value);
  }
}
