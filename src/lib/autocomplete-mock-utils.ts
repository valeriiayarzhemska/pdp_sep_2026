// Shared by every autocomplete mock endpoint on purpose: shorter queries get
// a deliberately *longer* simulated delay than longer, more specific ones.
// This isn't just flavor — it's what makes the "type 'fac', pause, then
// quickly add 'ebook'" race from the DFA reproduce reliably in the live
// demo, not just under a controlled test with fake timers. A broad query
// naturally costs a real search backend more to rank than a narrow one, so
// the simulation isn't unrealistic either.
export async function simulateSearchLatency(query: string): Promise<void> {
  const base = 200;
  const shortQueryPenalty = Math.max(0, 12 - query.length) * 60;
  const jitter = Math.random() * 150;

  await new Promise((resolve) =>
    setTimeout(resolve, base + shortQueryPenalty + jitter),
  );
}
