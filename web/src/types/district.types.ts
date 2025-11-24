// Election Creation Request
export interface District {
  id: number;
  electionId: number;
  desc1: string;
}

export interface CreateDistrictRequest {
  desc1: string;
}

export interface DistrictsResponse {
  data: District[];
  meta: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
    nextPage: number | null;
    previousPage: number | null;
  };
}

export interface DistrictCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDistrictCreated: (district: District) => void;
}

export interface DistrictUpdateDialogProps {
  district: District | null;
  isOpen: boolean;
  onClose: () => void;
  onDistrictUpdated: (district: District) => void;
}

export interface DistrictViewDialogProps {
  district: District | null;
  isOpen: boolean;
  onClose: () => void;
}
