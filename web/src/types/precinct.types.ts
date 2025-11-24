// Election Creation Request
export interface Precinct {
  id: number;
  desc1: string;
}

export interface CreatePrecinctRequest {
  desc1: string;
}

export interface PrecinctsResponse {
  data: Precinct[];
  meta: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
    nextPage: number | null;
    previousPage: number | null;
  };
}

export interface PrecinctCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPrecinctCreated: (precinct: Precinct) => void;
}

export interface PrecinctUpdateDialogProps {
  precinct: Precinct | null;
  isOpen: boolean;
  onClose: () => void;
  onPrecinctUpdated: (precinct: Precinct) => void;
}

export interface PrecinctViewDialogProps {
  precinct: Precinct | null;
  isOpen: boolean;
  onClose: () => void;
}
