import { TestBed } from '@angular/core/testing';
import { EMPTY_EXTENSION_RULE_CONTEXT, ExtensionRuleRegistry } from './extension-rules';

/**
 * Nested composite rules must not fail open.
 *
 * These pin a defect an adversarial review found: recursion was bounded by a
 * `Set<string>` of visited rule *types*, so re-using a composite at two depths was
 * misread as a cycle and short-circuited to `true`. The consequence was a security
 * gate opening —
 *
 *   core.some('app.rules.hasAdministrationAccess', core.some('app.rules.isPowerUser'))
 *
 * returned `true` for a user who is neither, while the flat equivalent returned
 * `false`. The flat control is kept below precisely because its passing is what proved
 * nesting was the cause.
 *
 * Watched fail on purpose: restoring the type-tracking implementation turns the first
 * three of these red.
 */
describe('nested composite rules', () => {
  let rules: ExtensionRuleRegistry;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    rules = TestBed.inject(ExtensionRuleRegistry);
    rules.registerRules({
      'app.rules.hasAdministrationAccess': () => false,
      'app.rules.isPowerUser': () => false,
    });
  });

  const ctx = EMPTY_EXTENSION_RULE_CONTEXT;

  it('nested core.some of two false rules is false, like the flat form', () => {
    expect(
      rules.evaluate(
        {
          type: 'core.some',
          parameters: [
            'app.rules.hasAdministrationAccess',
            { type: 'core.some', parameters: ['app.rules.isPowerUser'] },
          ],
        },
        ctx,
      ),
    ).toBe(false);
    // the flat control that already worked
    expect(
      rules.evaluate(
        {
          type: 'core.some',
          parameters: ['app.rules.hasAdministrationAccess', 'app.rules.isPowerUser'],
        },
        ctx,
      ),
    ).toBe(false);
  });

  it('nested core.every short-circuits correctly', () => {
    expect(
      rules.evaluate(
        {
          type: 'core.every',
          parameters: ['core.true', { type: 'core.every', parameters: ['core.false'] }],
        },
        ctx,
      ),
    ).toBe(false);
  });

  it('double core.not is identity', () => {
    expect(
      rules.evaluate(
        { type: 'core.not', parameters: [{ type: 'core.not', parameters: ['core.true'] }] },
        ctx,
      ),
    ).toBe(true);
  });

  it('a security-relevant rule fails CLOSED when depth is exceeded', () => {
    rules.declareFailClosed(['app.rules.deepAdmin']);
    rules.registerRules({
      'app.rules.deepAdmin': (c, p, resolve) => resolve('app.rules.deepAdmin'),
    });
    expect(rules.evaluate('app.rules.deepAdmin', ctx)).toBe(false);
  });

  it('a non-security rule fails open when depth is exceeded, and does not overflow', () => {
    rules.registerRules({ 'app.rules.loop': (c, p, resolve) => resolve('app.rules.loop') });
    expect(rules.evaluate('app.rules.loop', ctx)).toBe(true);
  });
});
