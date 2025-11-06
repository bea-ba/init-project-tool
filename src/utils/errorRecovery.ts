import { toast } from 'sonner';

// Retry configuration
export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay?: number;
  backoffFactor?: number;
}

// Default retry configuration
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
};

/**
 * Retry an operation with exponential backoff
 */
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> => {
  const { maxRetries, initialDelay, maxDelay, backoffFactor } = {
    ...DEFAULT_RETRY_CONFIG,
    ...config,
  };

  let lastError: Error;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on certain error types
      if (error instanceof TypeError && error.message.includes('Required')) {
        throw error;
      }

      if (attempt === maxRetries) {
        console.error(`Operation failed after ${maxRetries} retries:`, error);
        break;
      }

      // Wait before retrying with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * (backoffFactor || 2), maxDelay || 10000);

      console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
    }
  }

  throw lastError;
};

/**
 * Safe localStorage operation with recovery
 */
export const safeLocalStorageOperation = <T>(
  operation: () => T,
  fallback: T,
  operationName: string = 'operation'
): T => {
  try {
    return operation();
  } catch (error) {
    console.error(`localStorage ${operationName} failed:`, error);

    // Check if it's a quota exceeded error
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      toast.error('Storage quota exceeded. Try clearing old data.');
    } else {
      toast.error(`Failed to save data. ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return fallback;
  }
};

/**
 * Create a circuit breaker for operations that might fail repeatedly
 */
export class CircuitBreaker<T = any> {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000, // 1 minute
    private monitorPeriod: number = 10000 // 10 seconds
  ) {}

  async execute(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();

      if (this.state === 'HALF_OPEN') {
        this.reset();
      }

      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
      console.warn(`Circuit breaker OPEN after ${this.failureCount} failures`);
    }
  }

  private reset() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }
}

/**
 * Debounce function to prevent rapid successive calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Network status helper
 */
export const checkNetworkStatus = (): boolean => {
  return navigator.onLine;
};

export const withNetworkCheck = async <T>(
  operation: () => Promise<T>,
  offlineFallback?: () => T | Promise<T>
): Promise<T> => {
  if (!checkNetworkStatus()) {
    toast.warning('You appear to be offline. Some features may not work.');

    if (offlineFallback) {
      return offlineFallback();
    }

    throw new Error('Offline: No network connection available');
  }

  try {
    return await operation();
  } catch (error) {
    // Check if error might be network related
    if (
      error instanceof Error &&
      (error.message.includes('fetch') ||
       error.message.includes('network') ||
       error.message.includes('connection'))
    ) {
      if (!checkNetworkStatus()) {
        toast.error('Network connection lost. Please check your internet connection.');
      }
    }

    throw error;
  }
};

/**
 * Create a graceful wrapper for async operations
 */
export const gracefulAsync = async <T>(
  promise: Promise<T>,
  fallback?: T,
  errorMessage?: string
): Promise<T> => {
  try {
    return await promise;
  } catch (error) {
    console.error(errorMessage || 'Async operation failed:', error);

    if (fallback !== undefined) {
      return fallback;
    }

    throw error;
  }
};