// Hot ranking: score divided by a time-decay factor (Hacker News style).
// The +2 hours offset stops brand-new posts from dividing by ~0, and the 1.5
// exponent makes a post lose half its pull after roughly a day, so fresh
// posts can beat older ones with more votes.
export function hotScore(score, createdAt, now = Date.now()) {
  const ageHours = Math.max(0, (now - new Date(createdAt).getTime()) / 3_600_000);
  return score / Math.pow(ageHours + 2, 1.5);
}
