type FinancingPayload = {
  downPayment: number;
  term: number;
};

const listeners = new Set<(payload: FinancingPayload) => void>();

export function emitFinancingApplied(payload: FinancingPayload) {
  listeners.forEach((listener) => listener(payload));
}

export function subscribeFinancingApplied(listener: (payload: FinancingPayload) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
