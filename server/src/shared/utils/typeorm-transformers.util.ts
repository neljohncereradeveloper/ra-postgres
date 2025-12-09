import { ValueTransformer } from 'typeorm';

/**
 * Transformer to convert string values to lowercase before saving to database
 * and preserve the original case when reading from database
 */
export const lowercaseTransformer: ValueTransformer = {
  to: (value: string | null | undefined): string | null => {
    if (value === null || value === undefined) {
      return null;
    }
    return typeof value === 'string' ? value.toLowerCase() : value;
  },
  from: (value: string | null | undefined): string | null => {
    return value;
  },
};
