// Election Creation Request
export interface Position {
  id: number;
  electionId: number;
  desc1: string;
  maxCandidates: number;
  termLimit: string;
  deletedAt: string | null;
}

export interface CreatePositionRequest {
  desc1: string;
  maxCandidates: number;
  termLimit: string;
}

export interface PositionsResponse {
  data: Position[];
  meta: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
    nextPage: number | null;
    previousPage: number | null;
  };
}

export interface PositionCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPositionCreated: (position: Position) => void;
}

export interface PositionUpdateDialogProps {
  position: Position | null;
  isOpen: boolean;
  onClose: () => void;
  onPositionUpdated: (position: Position) => void;
}

export interface PositionViewDialogProps {
  position: Position | null;
  isOpen: boolean;
  onClose: () => void;
}
