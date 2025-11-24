export interface Delegate {
  id: number;
  branch: string;
  accountId: string;
  accountName: string;
  age: number;
  birthDate: string;
  address: string;
  tell: string;
  cell: string | null;
  dateOpened: string;
  clientType: string;
  balance: string;
  loanStatus: string;
  mevStatus: string;
  deletedAt: string | null;
  electionId: number;
  election: string;
  hasVoted: number;
  controlNumber: string;
}

export interface DelegatesResponse {
  data: Delegate[];
  meta: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
    nextPage: number | null;
    previousPage: number | null;
  };
}
