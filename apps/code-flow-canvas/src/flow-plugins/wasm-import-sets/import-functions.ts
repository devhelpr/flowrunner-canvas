import { IImportFunction, Valtype } from './interface';

const wasiFDWriteFunction = {
  nameSpace: 'wasi_unstable',
  functionName: 'fd_write',
  handler: function (arg1: number, arg2: number, arg3: number, arg4: number) {
    console.log('log from wasm', arg1, arg2, arg3, arg4, this as any);

    const addressBuffer = new Uint32Array((this as any).exports.memory.buffer, 0, 1);
    const stringLength = new Uint32Array((this as any).exports.memory.buffer, 4, 1);

    const textDecoder = new TextDecoder();
    const textString = textDecoder.decode(
      new Uint8Array((this as any).exports.memory.buffer, addressBuffer[0], stringLength[0]),
    );
    if (this && (this as any).callingContext && (this as any).callingContext.callback) {
      (this as any).callingContext.callback(textString);
    }
    console.log('Print String', textString, this);
  },
  params: [Valtype.i32, Valtype.i32, Valtype.i32, Valtype.i32],
  returnType: Valtype.i32,
  isInternal: false,
};

export const wasiDefinition: IImportFunction[] = [wasiFDWriteFunction];

const logFunction = {
  functionName: 'log',
  handler: function (arg: number) {
    console.log('log from wasm', arg, this as any);

    if (this && (this as any).callingContext && (this as any).callingContext) {
      (this as any).callingContext.callback(arg);
    }
  },
  params: [Valtype.f32],
  returnType: Valtype.f32,
  isInternal: false,
};

const printStringFunction = {
  functionName: 'printString',
  handler: function (address: number, length: number) {
    // for functions: this is bind to the webassembly instance of what
    // this function is called with
    // (doesn't work for arrow functions)
    const textDecoder = new TextDecoder();
    const textString = textDecoder.decode(new Uint8Array((this as any).exports.memory.buffer, address, length));
    if (this && (this as any).callingContext && (this as any).callingContext.callback) {
      (this as any).callingContext.callback(textString);
    }
    console.log('Print String', textString, this);

    //alert(textString);
  },
  params: [Valtype.i32, Valtype.i32],
  returnType: Valtype.i32,
  isInternal: true,
};

export const sendMemoryToNodeFunction = {
  functionName: 'showMemory',
  handler: function (address: number, length: number) {
    // for functions: this is bind to the webassembly instance of what
    // this function is called with
    // (doesn't work for arrow functions)
    // const memoryMap = transformMemoryToPayload((this as any).exports.memory.buffer);
    // if (this && (this as any).callingContext && (this as any).callingContext.sendMemoryToNode) {
    // 	(this as any).callingContext.sendMemoryToNode("MemoryVisualizer", memoryMap);
    // }
  },
  params: [],
  returnType: Valtype.i32,
  isInternal: false,
};

export const sendI32VariableToNodeFunction = {
  functionName: 'sendI32VariableToNode',
  handler: function (nodeIndex: number, variableValue: number) {
    // for functions: this is bind to the webassembly instance of what
    // this function is called with
    // (doesn't work for arrow functions)
    /*
			first parameter is the identity-index of the node
			.. node are registered when parsing the nodes and generating the script
			.. pushed as constant to the stack in the compiler
			second parameter is the variable-index
			.. currently only support for f32 parameters
			.. in the compiler push the variable value on the stack


			.. isInternal should be true
			.. because we need a custom implementation in the compiler to
			   handle the above parameters
		*/
    // if (this && (this as any).callingContext && (this as any).callingContext.sendVariableToNode) {
    // 	(this as any).callingContext.sendVariableToNode((this as any).callingContext.flowNodes[nodeIndex].name, variableValue);
    // }
  },
  params: [Valtype.i32, Valtype.i32],
  returnType: Valtype.i32,
  isInternal: true,
};
export const sendF32VariableToNodeFunction = {
  functionName: 'sendF32VariableToNode',
  handler: function (nodeIndex: number, variableValue: number) {
    // for functions: this is bind to the webassembly instance of what
    // this function is called with
    // (doesn't work for arrow functions)
    /*
			first parameter is the identity-index of the node
			.. node are registered when parsing the nodes and generating the script
			.. pushed as constant to the stack in the compiler
			second parameter is the variable-index
			.. currently only support for f32 parameters
			.. in the compiler push the variable value on the stack


			.. isInternal should be true
			.. because we need a custom implementation in the compiler to
			   handle the above parameters
		*/
    // if (this && (this as any).callingContext && (this as any).callingContext.sendVariableToNode) {
    // 	(this as any).callingContext.sendVariableToNode((this as any).callingContext.flowNodes[nodeIndex].name, variableValue);
    // }
  },
  params: [Valtype.i32, Valtype.f32],
  returnType: Valtype.i32,
  isInternal: true,
};

const sendToOutput = {
  functionName: 'sendToOutput',
  handler: function (arg: number) {
    if (this && (this as any).callingContext && (this as any).callingContext) {
      (this as any).callingContext.sendToOutput(arg);
    }
  },
  params: [Valtype.f32],
  returnType: Valtype.f32,
  isInternal: false,
};

export const logPrintStringDefinition: IImportFunction[] = [
  logFunction,
  printStringFunction,
  sendMemoryToNodeFunction,
  sendI32VariableToNodeFunction,
  sendF32VariableToNodeFunction,
  sendToOutput,
];

export const functionDefinitions: IImportFunction[] = [
  {
    functionName: 'sin',
    handler: (arg: number) => Math.sin(arg),
    params: [Valtype.f32],
    returnType: Valtype.f32,
    isInternal: false,
  },
  {
    functionName: 'cos',
    handler: (arg: number) => Math.cos(arg),
    params: [Valtype.f32],
    returnType: Valtype.f32,
    isInternal: false,
  },
  {
    functionName: 'tan',
    handler: (arg: number) => Math.tan(arg),
    params: [Valtype.f32],
    returnType: Valtype.f32,
    isInternal: false,
  },
  logFunction,
  {
    functionName: 'pow',
    handler: (x: number, y: number) => Math.pow(x, y),
    params: [Valtype.f32, Valtype.f32],
    returnType: Valtype.f32,
    isInternal: false,
  },
  printStringFunction,
];
