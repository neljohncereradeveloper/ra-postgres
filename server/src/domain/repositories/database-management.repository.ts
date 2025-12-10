export interface DatabaseManagementRepository {
  performBackup(req: any, user_id: number): Promise<string>;
  performRestore(
    file_path: string,
    user_name: string,
    req: any,
  ): Promise<{ message: string; statusCode: number }>;
}
