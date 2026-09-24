import { describe, expect, it } from 'vitest';
import { canEndSos, sosDeliveryStates, sosReviewStates } from './sos-model';

describe('SOS visual prototype rules', () => {
  it('requires an explicit confirmation state before active SOS', () => {
    expect(sosReviewStates.indexOf('confirmation')).toBeLessThan(
      sosReviewStates.indexOf('active'),
    );
  });

  it('tracks every recipient independently', () => {
    expect(
      new Set(sosDeliveryStates.map(({ recipient }) => recipient)).size,
    ).toBe(sosDeliveryStates.length);
  });

  it('requires reauthentication before ending an SOS', () => {
    expect(canEndSos(false)).toBe(false);
    expect(canEndSos(true)).toBe(true);
  });
});
