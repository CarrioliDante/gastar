import { unstable_cache } from "next/cache";

/**
 * Wraps a per-user data fetch with Next.js server cache.
 * Cached until revalidateTag(`user:${userId}`) is called.
 */
export function userCache<T>(
  fn: () => Promise<T>,
  userId: string,
  keys: string[],
): Promise<T> {
  return unstable_cache(fn, [`${userId}`, ...keys], {
    tags: [`user:${userId}`],
    revalidate: 600, // 10 min fallback — mutations revalidate via tag
  })();
}
