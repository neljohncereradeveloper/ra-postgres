// domain/ports/excel-parser.port.ts
export interface ExcelParserPort {
  parse<T>(buffer: Buffer, schema: any): Promise<T[]>;
}
