import { Transform } from 'class-transformer';

/**
 * Transformer to convert string values to lowercase
 * Used with @Transform decorator from class-transformer
 */
export const toLowerCase = Transform(({ value }) =>
  typeof value === 'string' ? value.toLowerCase() : value,
);

/**
 * Transformer to convert string array values to lowercase
 * Used with @Transform decorator from class-transformer
 */
export const toLowerCaseArray = Transform(({ value }) =>
  Array.isArray(value)
    ? value.map((v) => (typeof v === 'string' ? v.toLowerCase() : v))
    : value,
);
