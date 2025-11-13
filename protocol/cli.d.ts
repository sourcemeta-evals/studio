/**
 * Common types for CLI command results
 */

/**
 * Position in a file: [lineStart, colStart, lineEnd, colEnd]
 * All values are 1-based and inclusive
 */
export type Position = [number, number, number, number];
