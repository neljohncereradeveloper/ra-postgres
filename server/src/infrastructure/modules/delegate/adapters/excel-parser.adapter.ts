// infrastructure/services/excel-parser.service.ts
import { Injectable } from '@nestjs/common';
import readXlsxFile from 'read-excel-file/node';
import { ExcelParserPort } from '@domain/ports/excel-parser.port';

@Injectable()
export class ExcelParserAdapter implements ExcelParserPort {
  async parse<T>(buffer: Buffer, schema: any): Promise<T[]> {
    const rows: any = await readXlsxFile(buffer, { schema });
    return rows;
  }
}
