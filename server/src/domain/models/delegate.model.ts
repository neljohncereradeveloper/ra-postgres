export class Delegate {
  id: number;
  electionId: number;
  branch: string;
  accountId: string;
  accountName: string;
  age: number;
  birthDate?: Date;
  address?: string;
  tell?: string;
  cell?: string;
  dateOpened?: Date;
  clientType?: string;
  balance: number;
  loanStatus: string;
  mevStatus: string;
  hasVoted?: boolean;
  controlNumber: string;
  deletedAt?: Date | null;

  constructor(params: {
    id?: number;
    branch: string;
    electionId: number;
    accountId: string;
    accountName: string;
    age: number;
    balance: number;
    loanStatus: string;
    mevStatus: string;
    controlNumber: string;
    clientType?: string;
    address?: string;
    tell?: string;
    cell?: string;
    dateOpened?: Date;
    birthDate?: Date;
    hasVoted?: boolean;
    deletedAt?: Date | null;
  }) {
    this.id = params.id;
    this.branch = params.branch;
    this.electionId = params.electionId;
    this.accountId = params.accountId;
    this.accountName = params.accountName;
    this.age = params.age;
    this.clientType = params.clientType;
    this.balance = params.balance;
    this.loanStatus = params.loanStatus;
    this.mevStatus = params.mevStatus;
    this.address = params.address;
    this.tell = params.tell;
    this.cell = params.cell;
    this.dateOpened = params.dateOpened;
    this.birthDate = params.birthDate;
    this.hasVoted = params.hasVoted;
    this.controlNumber = params.controlNumber;
    this.deletedAt = params.deletedAt;
  }
}
