// In-memory rate limiter for API requests
// Tracks requests per user per hour

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60 * 60 * 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;

    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  check(userId: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.limits.get(userId);

    // No entry or expired entry
    if (!entry || now > entry.resetTime) {
      const resetTime = now + this.windowMs;
      this.limits.set(userId, { count: 1, resetTime });
      return { allowed: true, remaining: this.maxRequests - 1, resetTime };
    }

    // Check if limit exceeded
    if (entry.count >= this.maxRequests) {
      return { allowed: false, remaining: 0, resetTime: entry.resetTime };
    }

    // Increment count
    entry.count++;
    this.limits.set(userId, entry);
    return { allowed: true, remaining: this.maxRequests - entry.count, resetTime: entry.resetTime };
  }

  private cleanup() {
    const now = Date.now();
    for (const [userId, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(userId);
      }
    }
  }

  reset(userId: string) {
    this.limits.delete(userId);
  }
}

// Multi-service rate limiter
interface ServiceConfig {
  maxRequests: number;
  windowMs: number;
}

class MultiServiceRateLimiter {
  private services: Map<string, RateLimiter> = new Map();

  constructor(configs: Record<string, ServiceConfig>) {
    for (const [service, config] of Object.entries(configs)) {
      this.services.set(service, new RateLimiter(config.maxRequests, config.windowMs));
    }
  }

  check(userId: string, service: string): { allowed: boolean; remaining: number; resetTime: number } {
    const limiter = this.services.get(service);
    if (!limiter) {
      throw new Error(`Unknown service: ${service}`);
    }
    return limiter.check(userId);
  }

  reset(userId: string, service: string): void {
    const limiter = this.services.get(service);
    if (limiter) {
      limiter.reset(userId);
    }
  }
}

// Export singleton instances
export const rateLimiter = new RateLimiter(100, 60 * 60 * 1000); // 100 requests per hour (legacy)

export const multiServiceRateLimiter = new MultiServiceRateLimiter({
  serper: { maxRequests: 10, windowMs: 60 * 60 * 1000 },  // 10 requests per hour per user
  gemini: { maxRequests: 5, windowMs: 60 * 60 * 1000 }     // 5 requests per hour per user
});
