import { redis } from "./redis";

// Atomic fixed-window counter. The TTL is set only when the key is first
// created, so all instances share one window keyed by Better Auth's
// IP+path rate-limit key.
const CONSUME_SCRIPT = `
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
end
if current > tonumber(ARGV[2]) then
  local ttl = redis.call('TTL', KEYS[1])
  if ttl < 0 then ttl = 0 end
  return {0, ttl}
end
return {1, 0}
`;

export const rateLimitStorage = {
	async consume(key: string, rule: { window: number; max: number }) {
		try {
			const result = await redis.eval<number[]>(
				CONSUME_SCRIPT,
				[`ratelimit:${key}`],
				[rule.window, rule.max],
			);
			const [allowed, retryAfter] = result ?? [0, 0];
			return {
				allowed: allowed === 1,
				retryAfter: retryAfter > 0 ? retryAfter : null,
			};
		} catch (error) {
			// Fail open so an Upstash outage cannot lock users out of auth.
			console.error("Rate limit storage unavailable", error);
			return { allowed: true, retryAfter: null };
		}
	},
};
