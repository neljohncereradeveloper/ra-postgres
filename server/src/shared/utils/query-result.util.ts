/**
 * Utility functions for handling database query results
 * Supports both MySQL and PostgreSQL result formats
 */

/**
 * Extracts rows from a query result, handling both MySQL and PostgreSQL formats
 * @param result - The raw query result from TypeORM manager.query()
 * @returns Array of rows
 */
export function extractRows(result: any): any[] {
  if (!result) {
    return [];
  }

  // PostgreSQL format: [rows, rowCount] when using RETURNING
  if (
    Array.isArray(result) &&
    result.length === 2 &&
    Array.isArray(result[0])
  ) {
    return result[0];
  }

  // TypeORM unwrapped format: direct array of rows
  if (Array.isArray(result)) {
    return result;
  }

  // MySQL format: result object with rows property
  if (result.rows && Array.isArray(result.rows)) {
    return result.rows;
  }

  return [];
}

/**
 * Gets the insert ID from a CREATE query result
 * Handles both MySQL (insertId) and PostgreSQL (RETURNING id) formats
 * @param result - The raw query result from TypeORM manager.query()
 * @returns The inserted ID, or null if not found
 */
export function getInsertId(result: any): number | null {
  if (!result) {
    return null;
  }

  // PostgreSQL format: [rows, rowCount] when using RETURNING
  if (
    Array.isArray(result) &&
    result.length === 2 &&
    Array.isArray(result[0]) &&
    result[0].length > 0
  ) {
    return result[0][0].id || null;
  }

  // TypeORM unwrapped format: direct array with first row
  if (Array.isArray(result) && result.length > 0) {
    return result[0]?.id || null;
  }

  // MySQL format: result object with insertId
  if (result.insertId) {
    return result.insertId;
  }

  // MySQL format: result object with insertId as number
  if (typeof result === 'object' && 'insertId' in result) {
    return result.insertId;
  }

  return null;
}

/**
 * Gets the number of affected rows from an UPDATE/DELETE query result
 * Handles both MySQL (affectedRows) and PostgreSQL ([rows, rowCount]) formats
 * @param result - The raw query result from TypeORM manager.query()
 * @returns The number of affected rows
 */
export function getAffectedRows(result: any): number {
  if (!result) {
    return 0;
  }

  // PostgreSQL format: [rows, rowCount] when using RETURNING
  if (
    Array.isArray(result) &&
    result.length === 2 &&
    typeof result[1] === 'number'
  ) {
    return result[1];
  }

  // MySQL format: result object with affectedRows
  if (result.affectedRows !== undefined) {
    return result.affectedRows;
  }

  // If result is an array of rows, return the length
  if (Array.isArray(result)) {
    return result.length;
  }

  return 0;
}

/**
 * Checks if an UPDATE/DELETE query affected any rows
 * @param result - The raw query result from TypeORM manager.query()
 * @returns True if at least one row was affected
 */
export function hasAffectedRows(result: any): boolean {
  return getAffectedRows(result) > 0;
}

/**
 * Gets the first row from a query result
 * Handles both MySQL and PostgreSQL formats
 * @param result - The raw query result from TypeORM manager.query()
 * @returns The first row, or null if no rows
 */
export function getFirstRow(result: any): any | null {
  const rows = extractRows(result);
  return rows.length > 0 ? rows[0] : null;
}
