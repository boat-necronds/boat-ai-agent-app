// Re-export for convenience
export { createClient as createBrowserClient } from "./client";
export { createClient as createServerClient } from "./server";
export {
  updateSession,
  createClient as createMiddlewareClient,
} from "./middleware";
