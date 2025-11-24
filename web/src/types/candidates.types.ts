import { Delegate } from "./delegates.types";

// Election Creation Request
export interface Candidate {
  id: number;
  delegateId?: number;
  displayName: string;
  accountId: string;
  accountName: string;
  position: string;
  district: string;
  election: string;
}

export interface CreateCandidateRequest {
  delegateId?: number;
  position: string;
  district: string;
  displayName: string;
}

export interface CandidatesResponse {
  data: Candidate[];
  meta: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
    nextPage: number | null;
    previousPage: number | null;
  };
}

export interface CandidateCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  delegate: Delegate;
}

export interface CandidateUpdateDialogProps {
  candidate: Candidate | null;
  isOpen: boolean;
  onClose: () => void;
  onCandidateUpdated: (candidate: Candidate) => void;
}

export interface CandidateViewDialogProps {
  candidate: Candidate | null;
  isOpen: boolean;
  onClose: () => void;
}
