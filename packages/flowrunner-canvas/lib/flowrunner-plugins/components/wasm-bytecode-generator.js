import { unsignedLEB128, encodeString } from './encoding';
const flatten = (arr) => [].concat.apply([], arr);
var Section;
(function (Section) {
    Section[Section["custom"] = 0] = "custom";
    Section[Section["type"] = 1] = "type";
    Section[Section["import"] = 2] = "import";
    Section[Section["func"] = 3] = "func";
    Section[Section["table"] = 4] = "table";
    Section[Section["memory"] = 5] = "memory";
    Section[Section["global"] = 6] = "global";
    Section[Section["export"] = 7] = "export";
    Section[Section["start"] = 8] = "start";
    Section[Section["element"] = 9] = "element";
    Section[Section["code"] = 10] = "code";
    Section[Section["data"] = 11] = "data";
})(Section || (Section = {}));
export var Valtype;
(function (Valtype) {
    Valtype[Valtype["i32"] = 127] = "i32";
    Valtype[Valtype["f32"] = 125] = "f32";
})(Valtype || (Valtype = {}));
export var Opcodes;
(function (Opcodes) {
    Opcodes[Opcodes["block"] = 2] = "block";
    Opcodes[Opcodes["end"] = 11] = "end";
    Opcodes[Opcodes["loop"] = 3] = "loop";
    Opcodes[Opcodes["if"] = 4] = "if";
    Opcodes[Opcodes["else"] = 5] = "else";
    Opcodes[Opcodes["br"] = 12] = "br";
    Opcodes[Opcodes["br_if"] = 13] = "br_if";
    Opcodes[Opcodes["return"] = 15] = "return";
    Opcodes[Opcodes["call"] = 16] = "call";
    Opcodes[Opcodes["drop"] = 26] = "drop";
    Opcodes[Opcodes["get_local"] = 32] = "get_local";
    Opcodes[Opcodes["set_local"] = 33] = "set_local";
    Opcodes[Opcodes["get_global"] = 35] = "get_global";
    Opcodes[Opcodes["set_global"] = 36] = "set_global";
    Opcodes[Opcodes["i32_store"] = 54] = "i32_store";
    Opcodes[Opcodes["f32_store"] = 56] = "f32_store";
    Opcodes[Opcodes["memory_size"] = 63] = "memory_size";
    Opcodes[Opcodes["memory_grow"] = 64] = "memory_grow";
    Opcodes[Opcodes["i32_const"] = 65] = "i32_const";
    Opcodes[Opcodes["f32_const"] = 67] = "f32_const";
    Opcodes[Opcodes["i32_eq"] = 70] = "i32_eq";
    Opcodes[Opcodes["i32_ne"] = 71] = "i32_ne";
    Opcodes[Opcodes["i32_lt"] = 72] = "i32_lt";
    Opcodes[Opcodes["i32_gt"] = 74] = "i32_gt";
    Opcodes[Opcodes["i32_le"] = 76] = "i32_le";
    Opcodes[Opcodes["i32_ge"] = 78] = "i32_ge";
    Opcodes[Opcodes["i32_add"] = 106] = "i32_add";
    Opcodes[Opcodes["i32_sub"] = 107] = "i32_sub";
    Opcodes[Opcodes["i32_mul"] = 108] = "i32_mul";
    Opcodes[Opcodes["i32_div_s"] = 109] = "i32_div_s";
    Opcodes[Opcodes["i32_div_u"] = 110] = "i32_div_u";
    Opcodes[Opcodes["i32_and"] = 113] = "i32_and";
    Opcodes[Opcodes["i32_or"] = 114] = "i32_or";
    Opcodes[Opcodes["i32_xor"] = 115] = "i32_xor";
    Opcodes[Opcodes["i32_shl"] = 116] = "i32_shl";
    Opcodes[Opcodes["i32_shr_s"] = 117] = "i32_shr_s";
    Opcodes[Opcodes["i32_shr_u"] = 118] = "i32_shr_u";
    Opcodes[Opcodes["i32_rotli"] = 119] = "i32_rotli";
    Opcodes[Opcodes["i32_rort"] = 120] = "i32_rort";
    Opcodes[Opcodes["f32_sqrt"] = 145] = "f32_sqrt";
    Opcodes[Opcodes["f32_add"] = 146] = "f32_add";
    Opcodes[Opcodes["f32_sub"] = 147] = "f32_sub";
    Opcodes[Opcodes["f32_mul"] = 148] = "f32_mul";
    Opcodes[Opcodes["f32_div"] = 149] = "f32_div";
    Opcodes[Opcodes["f32_ne"] = 92] = "f32_ne";
    Opcodes[Opcodes["f32_eq"] = 91] = "f32_eq";
    Opcodes[Opcodes["f32_ge"] = 96] = "f32_ge";
    Opcodes[Opcodes["f32_lt"] = 93] = "f32_lt";
    Opcodes[Opcodes["f32_le"] = 95] = "f32_le";
    Opcodes[Opcodes["f32_gt"] = 94] = "f32_gt";
    Opcodes[Opcodes["i32_trunc_f32_s"] = 168] = "i32_trunc_f32_s";
    Opcodes[Opcodes["i32_trunc_f32_u"] = 169] = "i32_trunc_f32_u";
    Opcodes[Opcodes["f32_convert_i32_s"] = 178] = "f32_convert_i32_s";
})(Opcodes || (Opcodes = {}));
export var Blocktype;
(function (Blocktype) {
    Blocktype[Blocktype["void"] = 64] = "void";
})(Blocktype || (Blocktype = {}));
var ExportType;
(function (ExportType) {
    ExportType[ExportType["func"] = 0] = "func";
    ExportType[ExportType["table"] = 1] = "table";
    ExportType[ExportType["mem"] = 2] = "mem";
    ExportType[ExportType["global"] = 3] = "global";
})(ExportType || (ExportType = {}));
const functionType = 0x60;
const emptyArray = 0x0;
const magicModuleHeader = [0x00, 0x61, 0x73, 0x6d];
const moduleVersion = [0x01, 0x00, 0x00, 0x00];
const encodeVector = (data) => {
    let flattened = flatten(data);
    return [...unsignedLEB128(data.length), ...flattened];
};
const encodeSectionVector = (data) => {
    let flattened = flatten(data);
    return [...unsignedLEB128(flattened.length), ...flattened];
};
const createSection = (sectionType, data) => [sectionType, ...encodeSectionVector(data)];
export const generate = (code, globals, functionList, functionCode, localVarablesList, localVarablesTypeList, inputVariables, width, height) => {
    let mainFunctionInputParameterTypes = [
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
    const mainFunctionType = [
        functionType,
        ...encodeVector(mainFunctionInputParameterTypes),
        ...encodeVector([Valtype.f32]),
    ];
    const sinFunctionType = [functionType, ...encodeVector([Valtype.f32]), ...encodeVector([Valtype.f32])];
    let functionTypes = [];
    let functionIndexes = [];
    let functionBodies = [];
    functionList.map((functionName, index) => {
        let functionValType = functionCode[index].valType;
        let localVarablesList = functionCode[index].localVarablesList;
        let localVarablesTypeList = functionCode[index].localVarablesTypeList;
        let params = [];
        functionCode[index].params.map((param) => {
            params.push(functionValType);
        });
        const customFunctionType = [functionType, ...encodeVector(params), ...encodeVector([functionValType])];
        functionTypes.push(customFunctionType);
        functionIndexes.push(2 + index);
        let localVariables = [];
        if (localVarablesList.length > params.length) {
            let loop = params.length;
            while (loop < localVarablesList.length) {
                localVariables.push([1, localVarablesTypeList[loop]]);
                loop++;
            }
        }
        functionBodies.push(encodeVector([
            localVariables.length,
            ...flatten(localVariables),
            ...functionCode[index].code,
            Opcodes.end,
        ]));
    });
    const typeSection = createSection(Section.type, encodeVector([mainFunctionType, sinFunctionType, ...functionTypes]));
    const funcSection = createSection(Section.func, encodeVector([0x00, ...functionIndexes]));
    const globalsSection = createSection(Section.global, [...globals]);
    let memoryBlocks = 4;
    let memSizeInBytes = width * height * 4;
    memoryBlocks = Math.ceil(memSizeInBytes / 65536);
    const memorySection = createSection(Section.memory, [1, 0, memoryBlocks]);
    const exportSection = createSection(Section.export, encodeVector([
        [
            ...encodeString('run'),
            ExportType.func,
            0x01,
        ],
        [...encodeString('memory'), ExportType.mem, 0x00],
    ]));
    let localVariables = [];
    if (localVarablesList.length > mainFunctionInputParameterTypes.length) {
        let loop = mainFunctionInputParameterTypes.length;
        while (loop < localVarablesList.length) {
            localVariables.push([1, localVarablesTypeList[loop]]);
            loop++;
        }
    }
    const mainFunctionBody = encodeVector([localVariables.length, ...flatten(localVariables), ...code, Opcodes.end]);
    const externalFunctionImport = [
        ...encodeString('imports'),
        ...encodeString('sin'),
        ExportType.func,
        0x01,
    ];
    const importSection = createSection(Section.import, encodeVector([externalFunctionImport]));
    const codeSection = createSection(Section.code, encodeVector([mainFunctionBody, ...functionBodies]));
    return Uint8Array.from([
        ...magicModuleHeader,
        ...moduleVersion,
        ...typeSection,
        ...importSection,
        ...funcSection,
        ...memorySection,
        ...globalsSection,
        ...exportSection,
        ...codeSection,
    ]);
};
//# sourceMappingURL=wasm-bytecode-generator.js.map