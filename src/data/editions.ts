import type { Edition } from "./types";
import { editionsA } from "./editions-a";
import { editionsB } from "./editions-b";

export const editions: Edition[] = [...editionsA, ...editionsB];
