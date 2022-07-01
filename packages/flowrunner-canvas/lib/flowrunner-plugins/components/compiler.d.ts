import { Valtype } from './wasm-bytecode-generator';
export declare class Compiler {
    compile: (ast: any, values?: any) => {
        codes: number[];
        globalvariablesCodes: any[];
        globalVariableList: string[];
        localVarablesList: string[];
        localVarablesTypeList: Valtype[];
        variableStoreTypes: any;
        functionList: string[];
        functionCode: any[];
        inputVariables: string[];
    };
    variableStore: any;
    externalValues: any;
    globalVariableList: string[];
    variableStoreTypes: any;
    codes: number[];
    globalvariablesCodes: any[];
    functionList: string[];
    functionCode: any[];
    localVarablesList: string[];
    localVarablesTypeList: Valtype[];
    inputVariables: string[];
    mainProgram: (astNode: any) => void;
    statement: (statementNode: any) => void;
    inputStatement: (inputStatement: any) => void;
    whileStatement: (whileStatementNode: any) => void;
    functionDeclaration: (functionDeclarationNode: any) => void;
    returnStatement: (returnStatementNode: any) => void;
    blockStatement: (blockStatementNode: any) => void;
    ifStatement: (ifStatementNode: any) => void;
    expressionStatement: (expressionStatementNode: any, includeDrop: boolean) => void;
    expression: (expression: any, valType: Valtype) => boolean;
    callExpression: (expressionNode: any, valType: Valtype) => boolean;
    binaryExpression: (expressionNode: any, valType: Valtype) => void;
    variableStatement: (variableNode: any) => void;
}
