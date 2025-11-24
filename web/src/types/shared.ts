export type PaginationMeta = {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
  nextPage: number | null;
  previousPage: number | null;
};

export interface IComboboxProps {
  value: string;
  label: string;
}

export interface ISharedComboboxProps {
  value?: string;
  onSelect: (value: string) => void;
  required?: boolean;
}
