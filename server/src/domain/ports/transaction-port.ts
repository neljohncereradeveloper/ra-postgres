export interface TransactionPort {
  executeTransaction<T>(
    action_log: string,
    work: (manager: any) => Promise<T>,
  ): Promise<T>;
}
