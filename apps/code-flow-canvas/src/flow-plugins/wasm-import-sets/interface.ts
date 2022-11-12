export enum Valtype {
  i32 = 0x7f,
  f32 = 0x7d,
  i64 = 0x7e,
  f64 = 0x7c,
  v128 = 0x7b,
}

export interface IImportFunction {
  nameSpace?: string;
  functionName: string;
  handler: any;
  params: Valtype[];
  returnType: Valtype;
  isInternal: boolean;
}
