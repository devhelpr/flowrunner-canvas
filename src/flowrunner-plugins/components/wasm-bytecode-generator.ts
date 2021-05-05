import { unsignedLEB128, encodeString } from './encoding';
const flatten = (arr: any[]) => [].concat.apply([], arr);

// https://coinexchain.medium.com/wasm-introduction-part-1-binary-format-57895d851580

// https://webassembly.github.io/spec/core/binary/modules.html#sections
enum Section {
  custom = 0,
  type = 1,
  import = 2,
  func = 3,
  table = 4,
  memory = 5,
  global = 6,
  export = 7,
  start = 8,
  element = 9,
  code = 10,
  data = 11,
}

// https://webassembly.github.io/spec/core/binary/types.html
export enum Valtype {
  i32 = 0x7f,
  f32 = 0x7d,
}

// https://webassembly.github.io/spec/core/binary/instructions.html
export enum Opcodes {
  block = 0x02,
  end = 0x0b,
  loop = 0x03,
  if = 0x04,
  else = 0x05,
  br = 0x0c,
  br_if = 0x0d,
  return = 0x0f,
  call = 0x10,
  drop = 0x1a,
  get_local = 0x20,
  set_local = 0x21,
  get_global = 0x23,
  set_global = 0x24,
  i32_store = 0x36,
  f32_store = 0x38,
  memory_size = 0x3f,
  memory_grow = 0x40,
  i32_const = 0x41,
  f32_const = 0x43,

  i32_eq = 0x46,
  i32_ne = 0x47,
  i32_lt = 0x48,
  i32_gt = 0x4a,
  i32_le = 0x4c,
  i32_ge = 0x4e,

  i32_add = 0x6a,
  i32_sub = 0x6b,
  i32_mul = 0x6c,
  i32_div_s = 0x6d,
  i32_div_u = 0x6e,

  i32_and = 0x71,
  i32_or = 0x72,
  i32_xor = 0x73,

  i32_shl = 0x74,
  i32_shr_s = 0x75,
  i32_shr_u = 0x76,
  i32_rotli = 0x77,
  i32_rort = 0x78,

  f32_sqrt = 0x91,
  f32_add = 0x92,
  f32_sub = 0x93,
  f32_mul = 0x94,
  f32_div = 0x95,
  f32_ne = 0x5c,
  f32_eq = 0x5b,
  f32_ge = 0x60,
  f32_lt = 0x5d,
  f32_le = 0x5f,
  f32_gt = 0x5e,

  i32_trunc_f32_s = 0xa8,
  i32_trunc_f32_u = 0xa9,
  f32_convert_i32_s = 0xb2,
}

export enum Blocktype {
  void = 0x40,
}

// http://webassembly.github.io/spec/core/binary/modules.html#export-section
enum ExportType {
  func = 0x00,
  table = 0x01,
  mem = 0x02,
  global = 0x03,
}

// http://webassembly.github.io/spec/core/binary/types.html#function-types
const functionType = 0x60;

const emptyArray = 0x0;

// https://webassembly.github.io/spec/core/binary/modules.html#binary-module
// 0x00 "asm"
const magicModuleHeader = [0x00, 0x61, 0x73, 0x6d];
const moduleVersion = [0x01, 0x00, 0x00, 0x00];

// https://webassembly.github.io/spec/core/binary/conventions.html#binary-vec
// Vectors are encoded with their length followed by their element sequence
const encodeVector = (data: any[]) => {
  let flattened = flatten(data);
  return [...unsignedLEB128(data.length), ...flattened];
};

const encodeSectionVector = (data: any[]) => {
  let flattened = flatten(data);
  return [...unsignedLEB128(flattened.length), ...flattened];
};

// https://webassembly.github.io/spec/core/binary/modules.html#sections
// sections are encoded by their type followed by their vector contents
const createSection = (sectionType: Section, data: any[]) => [sectionType, ...encodeSectionVector(data)];

export const generate = (
  code: any[],
  globals: any[],
  functionList: any[],
  functionCode: any,
  localVarablesList: string[],
  localVarablesTypeList: Valtype[],
  inputVariables: string[],
  width: number,
  height: number,
) => {
  // "x","y","" .. TODO : make this flexibel ..also valtype should be flexibel.. Not just f32
  let mainFunctionInputParameterTypes: Valtype[] = [
    Valtype.f32,
    Valtype.f32,
    Valtype.f32,
    Valtype.f32,
    Valtype.f32,
    Valtype.f32,
  ];
  if (inputVariables) {
    inputVariables.map(parameterName => {
      mainFunctionInputParameterTypes.push(Valtype.f32);
    });
  }

  // Function types are vectors of parameters and return types. Currently
  // WebAssembly only supports single return values
  const mainFunctionType = [
    functionType,
    ...encodeVector(mainFunctionInputParameterTypes),
    ...encodeVector([Valtype.f32]),
  ];

  const sinFunctionType = [functionType, ...encodeVector([Valtype.f32]), ...encodeVector([Valtype.f32])];

  let functionTypes: any[] = [];
  let functionIndexes: number[] = [];
  let functionBodies: any[] = [];

  functionList.map((functionName, index) => {
    let functionValType = functionCode[index].valType;
    let localVarablesList = functionCode[index].localVarablesList;
    let localVarablesTypeList = functionCode[index].localVarablesTypeList;

    let params: number[] = [];
    functionCode[index].params.map((param: any) => {
      params.push(functionValType);
    });

    const customFunctionType = [functionType, ...encodeVector(params), ...encodeVector([functionValType])];
    functionTypes.push(customFunctionType);
    functionIndexes.push(2 + index);

    let localVariables: any[] = [];

    if (localVarablesList.length > params.length) {
      //localVariables.push([localVarablesList.length - params.length,  Valtype.f32]);

      let loop = params.length;
      while (loop < localVarablesList.length) {
        localVariables.push([1, localVarablesTypeList[loop]]);
        loop++;
      }
    }
    functionBodies.push(
      encodeVector([
        localVariables.length,
        ...flatten(localVariables) /** locals */,
        ...functionCode[index].code,
        Opcodes.end,
      ]),
    );
  });

  // the type section is a vector of function types
  const typeSection = createSection(Section.type, encodeVector([mainFunctionType, sinFunctionType, ...functionTypes]));

  // the function section is a vector of type indices that indicate the type of each function
  // in the code section
  const funcSection = createSection(Section.func, encodeVector([0x00 /* type index */, ...functionIndexes]));

  const globalsSection = createSection(Section.global, [...globals]);

  let memoryBlocks = 4;
  let memSizeInBytes = width * height * 4;
  memoryBlocks = Math.ceil(memSizeInBytes / 65536);
  const memorySection = createSection(Section.memory, [1, 0, memoryBlocks]);

  const exportSection = createSection(
    Section.export,
    encodeVector([
      [
        ...encodeString('run'),
        ExportType.func,
        0x01 /* function index .. why is this 0x01 when you import functions ??? */,
      ],
      [...encodeString('memory'), ExportType.mem, 0x00],
    ]),
  );

  let localVariables: any[] = [];

  if (localVarablesList.length > mainFunctionInputParameterTypes.length) {
    // 4 is the number of mainprogram function parameters

    let loop = mainFunctionInputParameterTypes.length;
    while (loop < localVarablesList.length) {
      // localVariables.push([localVarablesList.length - 4, Valtype.f32]);
      localVariables.push([1, localVarablesTypeList[loop]]);
      loop++;
    }
  }

  const mainFunctionBody = encodeVector([localVariables.length, ...flatten(localVariables), ...code, Opcodes.end]);
  /*

    TODO : use localVarablesList parameter for local variables and remove the first 2 

    localvariabels:
    - total vectors
    - each vector consists of count - valType 
      (for example 2 i32 1 f32 : 
          2 local variables of type i32 and 1 of type f32... 
            so total vectors is 2 in this case and there 3 local variables)

            the index which references the local variabels start depends
              on the number of function parameters

              if function has 2 parameters then the index of the
                first local parameter is 2
          
  */

  //(import "imports" "console.log" (func $log (param i32)))

  /* limits https://webassembly.github.io/spec/core/binary/types.html#limits -
      indicates a min memory size of one page */

  /*
  const memoryImport = [
    ...encodeString("imports"),
    ...encodeString("memory"),
    ExportType.mem,
    0x00,
    0x01
  ];
  */

  const externalFunctionImport = [
    ...encodeString('imports'),
    ...encodeString('sin'),
    ExportType.func,
    0x01, // type index .. NOT a functon index
  ];

  /*
    function indexes... : 
      - imports start at 0 
      - wasm defined functions indexes follow afterwards
 // memoryImport // // ... this causes big problems when this is called multiple times .. tixy-frame 
  */

  const importSection = createSection(Section.import, encodeVector([externalFunctionImport]));

  const codeSection = createSection(Section.code, encodeVector([mainFunctionBody, ...functionBodies]));

  // het moet allemaal bij elkaar staan in 1 sectie...

  return Uint8Array.from([
    ...magicModuleHeader,
    ...moduleVersion,
    ...(typeSection as any),
    ...(importSection as any),
    ...(funcSection as any),
    ...(memorySection as any),
    ...(globalsSection as any),
    ...(exportSection as any),
    ...(codeSection as any),
  ]);
};
