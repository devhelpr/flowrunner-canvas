import { Parser } from './parser';
import { Compiler } from './compiler';
import { generate, Opcodes, Valtype } from './wasm-bytecode-generator';
import { ieee754 } from './encoding';
export const getWebassembly = async (code, width, height) => {
    let parser = new Parser();
    let ast = parser.parse(code);
    const compiler = new Compiler();
    let result;
    try {
        result = compiler.compile(ast, {});
    }
    catch (err) {
        console.log('compiler error !!', err);
        return false;
    }
    let globalvariablesCodes = [];
    globalvariablesCodes.push(result.globalVariableList.length);
    result.globalVariableList.map(globalVar => {
        globalvariablesCodes.push(Valtype.f32);
        globalvariablesCodes.push(0x01);
        globalvariablesCodes.push(Opcodes.f32_const);
        globalvariablesCodes.push(...ieee754(0));
        globalvariablesCodes.push(Opcodes.end);
    });
    let importObject = {
        imports: {
            sin: (arg) => Math.sin(arg),
        },
    };
    const wasm = generate(result.codes, globalvariablesCodes, result.functionList, result.functionCode, result.localVarablesList, result.localVarablesTypeList, result.inputVariables, width, height);
    const { instance } = await WebAssembly.instantiate(wasm, importObject);
    if (instance && instance.exports) {
        let additionalParameters = '';
        result.inputVariables.map(parameterName => {
            additionalParameters += ',' + parameterName;
        });
        return {
            wasm,
            instance,
            inputVariables: result.inputVariables,
            mainFunction: new Function('instance', 't', 'i', 'x', 'y', 'width', 'height', ...result.inputVariables, `return instance.exports.run(t,i,x,y,width,height${additionalParameters});`),
        };
    }
    return false;
};
//# sourceMappingURL=webassembly.js.map