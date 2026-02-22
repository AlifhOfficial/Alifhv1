import { createClient, type EdgeConfigClient } from '@vercel/edge-config';

// Create Edge Config client using the connection string from environment
// Set EDGE_CONFIG environment variable in Vercel or .env.local
const edgeConfig: EdgeConfigClient | null = process.env.EDGE_CONFIG
  ? createClient(process.env.EDGE_CONFIG)
  : null;

/**
 * Get a value from Edge Config
 * @param key - The key to retrieve
 * @returns The value or undefined if not found
 */
export async function getEdgeConfig<T = unknown>(key: string): Promise<T | undefined> {
  if (!edgeConfig) {
    console.warn('[EdgeConfig] EDGE_CONFIG environment variable not set');
    return undefined;
  }
  
  try {
    return await edgeConfig.get<T>(key);
  } catch (error) {
    console.error(`[EdgeConfig] Failed to get key "${key}":`, error);
    return undefined;
  }
}

/**
 * Check if a key exists in Edge Config
 * @param key - The key to check
 * @returns true if the key exists
 */
export async function hasEdgeConfig(key: string): Promise<boolean> {
  if (!edgeConfig) {
    return false;
  }
  
  try {
    return await edgeConfig.has(key);
  } catch (error) {
    console.error(`[EdgeConfig] Failed to check key "${key}":`, error);
    return false;
  }
}

/**
 * Get all items from Edge Config
 * @returns All key-value pairs
 */
export async function getAllEdgeConfig(): Promise<Record<string, unknown> | undefined> {
  if (!edgeConfig) {
    return undefined;
  }
  
  try {
    return await edgeConfig.getAll();
  } catch (error) {
    console.error('[EdgeConfig] Failed to get all items:', error);
    return undefined;
  }
}

/**
 * Get the Edge Config digest (version hash)
 * Useful for cache invalidation
 */
export async function getEdgeConfigDigest(): Promise<string | undefined> {
  if (!edgeConfig) {
    return undefined;
  }
  
  try {
    return await edgeConfig.digest();
  } catch (error) {
    console.error('[EdgeConfig] Failed to get digest:', error);
    return undefined;
  }
}

// Re-export the client for advanced usage
export { edgeConfig };
