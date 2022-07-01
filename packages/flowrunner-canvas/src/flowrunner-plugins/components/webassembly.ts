import { Parser } from './parser';
import { Compiler } from './compiler';

import { generate, Opcodes, Valtype } from './wasm-bytecode-generator';
import { ieee754 } from './encoding';

export interface IWebassembly {
  mainFunction: (
    instance: any,
    x: number,
    y: number,
    index: number,
    time: number,
    width: number,
    height: number,
    ...args
  ) => number;
  wasm: any;
  instance: any;
}

/*
  this.functionInstance = new Function('t', 'i', 'x', 'y', node.code);
  let result = this.functionInstance(payload.t, payload.i, payload.x, payload.y);
*/

export const getWebassembly = async (code: string, width, height) => {
  let parser = new Parser();
  let ast = parser.parse(code);

  const compiler = new Compiler();

  let result;
  try {
    result = compiler.compile(ast, {});
  } catch (err) {
    console.log('compiler error !!', err);
    return false;
  }
  let globalvariablesCodes: number[] = [];

  //console.log(ast, result);

  globalvariablesCodes.push(result.globalVariableList.length);
  result.globalVariableList.map(globalVar => {
    globalvariablesCodes.push(Valtype.f32);
    globalvariablesCodes.push(0x01);
    globalvariablesCodes.push(Opcodes.f32_const);
    globalvariablesCodes.push(...ieee754(0));
    globalvariablesCodes.push(Opcodes.end);
  });

  //(console as any).log(hexy(globalvariablesCodes, {format:"twos", annotate:"ascii"}));
  //(console as any).log(hexy(result.codes, {format:"twos", annotate:"ascii"}));
  //const memory = new WebAssembly.Memory({ initial: 1 });
  let importObject = {
    imports: {
      sin: (arg: number) => Math.sin(arg), //* Math.PI / 180
      //memory
    },
  };

  const wasm = generate(
    result.codes,
    globalvariablesCodes,
    result.functionList,
    result.functionCode,
    result.localVarablesList,
    result.localVarablesTypeList,
    result.inputVariables,
    width,
    height,
  );
  //(console as any).log(hexy(Array.from(wasm), {format:"twos", annotate:"ascii"}));
  const { instance } = await WebAssembly.instantiate(wasm, importObject);
  //console.log("WASM RESULT", (instance as any).exports.run(5, 6, 1 , 1));
  if (instance && instance.exports) {
    let additionalParameters = '';
    result.inputVariables.map(parameterName => {
      additionalParameters += ',' + parameterName;
    });

    return {
      wasm,
      instance,
      inputVariables: result.inputVariables,
      mainFunction: new Function(
        'instance',
        't',
        'i',
        'x',
        'y',
        'width',
        'height',
        ...result.inputVariables,
        `return instance.exports.run(t,i,x,y,width,height${additionalParameters});`,
      ),
    };
  }
  return false;
};
