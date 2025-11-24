export interface TransactionPort {
  executeTransaction<T>(
    actionlog: string,
    work: (manager: any) => Promise<T>,
  ): Promise<T>;
}
