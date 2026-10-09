import { AsyncLocalStorage } from "node:async_hooks";

/** Request-local IDs select only this request's newly committed accounts. */
export const signupContext = new AsyncLocalStorage<Set<string>>();
