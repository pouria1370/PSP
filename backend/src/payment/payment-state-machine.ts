import { PaymentStatus } from "./payment-status.enum";

const allowedTransitions: Record<PaymentStatus, PaymentStatus[]> = {
  [PaymentStatus.PENDING]: [PaymentStatus.AUTHORIZING, PaymentStatus.CANCELLED],

  [PaymentStatus.AUTHORIZING]: [
    PaymentStatus.AUTHORIZED,
    PaymentStatus.FAILED,
    PaymentStatus.UNKNOWN,
  ],

  [PaymentStatus.AUTHORIZED]: [PaymentStatus.SETTLED],

  [PaymentStatus.SETTLED]: [],

  [PaymentStatus.FAILED]: [],

  [PaymentStatus.UNKNOWN]: [
    PaymentStatus.AUTHORIZED,
    PaymentStatus.SETTLED,
    PaymentStatus.FAILED,
  ],

  [PaymentStatus.CANCELLED]: [],
};

export function canTransition(
  current: PaymentStatus,
  next: PaymentStatus,
): boolean {
  return allowedTransitions[current].includes(next);
}

export function assertCanTransition(
  current: PaymentStatus,
  next: PaymentStatus,
): void {
  if (!canTransition(current, next)) {
    throw new Error(`Invalid payment transition: ${current} -> ${next}`);
  }
}
