/**
 * CLI-related types
 * Types that represent CLI command results and errors
 */

/**
 * Represents a single point in a document with line and column coordinates.
 * Values are 1-based: [line, column]
 */
export type Point = [number, number];

/**
 * Represents a range/position in a document with start and end coordinates.
 * Values are 1-based: [startLine, startColumn, endLine, endColumn]
 */
export type Position = [number, number, number, number];

export interface LintError {
  id: string;
  message: string;
  description?: string | null;
  path: string;
  schemaLocation: string;
  position: Position | null;
}

export interface LintResult {
  raw: string;
  health: number | null;
  valid?: boolean;
  errors?: LintError[];
  error?: boolean;
}

export interface CommandResult {
  output: string;
  exitCode: number | null;
}

export interface MetaschemaError {
  error: string;
  instanceLocation: string;
  keywordLocation: string;
  absoluteKeywordLocation?: string;
  instancePosition?: Position;
}

export interface CliError {
  error: string;
  line?: number;
  column?: number;
  filePath?: string;
  identifier?: string;
  location?: string;
  rule?: string;
  testNumber?: number;
  uri?: string;
  command?: string;
  option?: string;
}

export interface MetaschemaResult extends CommandResult {
  errors?: (MetaschemaError | CliError)[];
}

export type FormatResult = CommandResult;
