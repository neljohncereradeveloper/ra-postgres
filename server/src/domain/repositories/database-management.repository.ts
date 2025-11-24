export interface DatabaseManagementRepository {
  performBackup(req: any, userId: number): Promise<string>;
  performRestore(
    filePath: string,
    username: string,
    req: any,
  ): Promise<{ message: string; statusCode: number }>;
}
