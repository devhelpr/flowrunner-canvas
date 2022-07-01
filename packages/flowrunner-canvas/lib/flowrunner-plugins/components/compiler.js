import { Opcodes, Blocktype, Valtype } from './wasm-bytecode-generator';
import { unsignedLEB128, ieee754 } from './encoding';
export class Compiler {
    constructor() {
        this.compile = (ast, values) => {
            this.codes = [];
            this.variableStore = {};
            this.externalValues = values || {};
            const result = this.mainProgram(ast);
            return {
                codes: this.codes,
                globalvariablesCodes: this.globalvariablesCodes,
                globalVariableList: this.globalVariableList,
                localVarablesList: this.localVarablesList,
                localVarablesTypeList: this.localVarablesTypeList,
                variableStoreTypes: this.variableStoreTypes,
                functionList: this.functionList,
                functionCode: this.functionCode,
                inputVariables: this.inputVariables,
            };
        };
        this.variableStore = {};
        this.externalValues = {};
        this.globalVariableList = [];
        this.variableStoreTypes = {};
        this.codes = [];
        this.globalvariablesCodes = [];
        this.functionList = [];
        this.functionCode = [];
        this.localVarablesList = [];
        this.localVarablesTypeList = [];
        this.inputVariables = [];
        this.mainProgram = (astNode) => {
            if (astNode && astNode.body && astNode.type === 'Program') {
                this.localVarablesList.push('x');
                this.localVarablesList.push('y');
                this.localVarablesList.push('index');
                this.localVarablesList.push('time');
                this.localVarablesList.push('width');
                this.localVarablesList.push('height');
                this.localVarablesTypeList.push(Valtype.f32);
                this.localVarablesTypeList.push(Valtype.f32);
                this.localVarablesTypeList.push(Valtype.f32);
                this.localVarablesTypeList.push(Valtype.f32);
                this.localVarablesTypeList.push(Valtype.f32);
                this.localVarablesTypeList.push(Valtype.f32);
                astNode.body.map((statementNode) => {
                    this.statement(statementNode);
                });
            }
        };
        this.statement = (statementNode) => {
            if (statementNode && statementNode.type) {
                switch (statementNode.type) {
                    case 'BlockStatement':
                        this.blockStatement(statementNode);
                        break;
                    case 'IfStatement':
                        this.ifStatement(statementNode);
                        break;
                    case 'ExpressionStatement':
                        this.expressionStatement(statementNode, true);
                        break;
                    case 'VariableStatement':
                        this.variableStatement(statementNode);
                        break;
                    case 'WhileStatement':
                        this.whileStatement(statementNode);
                        break;
                    case 'ReturnStatement':
                        this.returnStatement(statementNode);
                        break;
                    case 'FunctionDeclaration':
                        this.functionDeclaration(statementNode);
                        break;
                    case 'InputStatement':
                        this.inputStatement(statementNode);
                        break;
                }
            }
        };
        this.inputStatement = (inputStatement) => {
            if (inputStatement.id && inputStatement.id.type === 'Identifier') {
                this.inputVariables.push(inputStatement.id.name);
                this.localVarablesList.push(inputStatement.id.name);
                this.localVarablesTypeList.push(Valtype.f32);
            }
            else {
                throw new Error('Input declaration without Identifier');
            }
        };
        this.whileStatement = (whileStatementNode) => {
            if (whileStatementNode.test && whileStatementNode.body) {
                const test = whileStatementNode.test;
                this.codes.push(Opcodes.block);
                this.codes.push(Blocktype.void);
                this.expression(test, whileStatementNode.whileType ? Valtype.i32 : Valtype.f32);
                this.codes.push(Opcodes.i32_const);
                this.codes.push(...unsignedLEB128(0));
                this.codes.push(Opcodes.i32_ne);
                this.codes.push(Opcodes.if);
                this.codes.push(Blocktype.void);
                this.codes.push(Opcodes.block);
                this.codes.push(Blocktype.void);
                this.codes.push(Opcodes.loop);
                this.codes.push(Blocktype.void);
                this.statement(whileStatementNode.body);
                this.expression(test, whileStatementNode.whileType ? Valtype.i32 : Valtype.f32);
                this.codes.push(Opcodes.i32_const);
                this.codes.push(...unsignedLEB128(0));
                this.codes.push(Opcodes.i32_eq);
                this.codes.push(Opcodes.br_if);
                this.codes.push(...unsignedLEB128(1));
                this.codes.push(Opcodes.br);
                this.codes.push(...unsignedLEB128(0));
                this.codes.push(Opcodes.end);
                this.codes.push(Opcodes.end);
                this.codes.push(Opcodes.end);
                this.codes.push(Opcodes.end);
            }
        };
        this.functionDeclaration = (functionDeclarationNode) => {
            if (functionDeclarationNode.name && functionDeclarationNode.name.type !== 'Identifier') {
                throw new Error(`Unknown function name type "${functionDeclarationNode.name.type}"`);
            }
            let storeCode = [...this.codes];
            let storeLocalVariables = [...this.localVarablesList];
            let storeLocalVarablesTypeList = [...this.localVarablesTypeList];
            this.codes = [];
            this.localVarablesList = [];
            this.localVarablesTypeList = [];
            this.functionList.push(functionDeclarationNode.name.name);
            functionDeclarationNode.params.map((param) => {
                if (param.type == 'Identifier') {
                    this.localVarablesList.push(param.name);
                    this.localVarablesTypeList.push(functionDeclarationNode.functionType == 'i32' ? Valtype.i32 : Valtype.f32);
                }
                else {
                    throw new Error(`Unknown parameter type "${param.type}" in "${functionDeclarationNode.name.name}"`);
                }
            });
            this.blockStatement(functionDeclarationNode.body);
            this.functionCode.push({
                name: functionDeclarationNode.name.name,
                code: [...this.codes],
                paramCount: functionDeclarationNode.params.length,
                params: [...functionDeclarationNode.params],
                localVarablesList: [...this.localVarablesList],
                localVarablesTypeList: [...this.localVarablesTypeList],
                valType: functionDeclarationNode.functionType == 'i32' ? Valtype.i32 : Valtype.f32,
            });
            this.codes = storeCode;
            this.localVarablesList = storeLocalVariables;
            this.localVarablesTypeList = storeLocalVarablesTypeList;
        };
        this.returnStatement = (returnStatementNode) => {
            if (returnStatementNode.argument) {
                this.binaryExpression(returnStatementNode.argument, returnStatementNode.returnType == 'i32' ? Valtype.i32 : Valtype.f32);
            }
        };
        this.blockStatement = (blockStatementNode) => {
            if (blockStatementNode && blockStatementNode.body) {
                blockStatementNode.body.map((statementNode) => {
                    this.statement(statementNode);
                });
            }
        };
        this.ifStatement = (ifStatementNode) => {
            if (ifStatementNode.test && ifStatementNode.consequent) {
                const test = ifStatementNode.test;
                const consequent = ifStatementNode.consequent;
                this.codes.push(Opcodes.block);
                this.codes.push(Blocktype.void);
                if (test.type === 'BinaryExpression' || test.type === 'LogicalExpression') {
                    this.expression(test, Valtype.f32);
                }
                this.codes.push(Opcodes.i32_const);
                this.codes.push(...unsignedLEB128(0));
                this.codes.push(Opcodes.i32_ne);
                this.codes.push(Opcodes.if);
                this.codes.push(Valtype.f32);
                if (consequent) {
                    this.statement(consequent);
                    this.codes.push(Opcodes.f32_const);
                    this.codes.push(...ieee754(0));
                }
                if (ifStatementNode.alternate) {
                    this.codes.push(Opcodes.else);
                    this.statement(ifStatementNode.alternate);
                    this.codes.push(Opcodes.f32_const);
                    this.codes.push(...ieee754(0));
                }
                else {
                    this.codes.push(Opcodes.else);
                    this.codes.push(Opcodes.f32_const);
                    this.codes.push(...ieee754(0));
                }
                this.codes.push(Opcodes.end);
                this.codes.push(Opcodes.drop);
                this.codes.push(Opcodes.end);
            }
        };
        this.expressionStatement = (expressionStatementNode, includeDrop) => {
            if (expressionStatementNode && expressionStatementNode.expression) {
                const expression = expressionStatementNode.expression;
                let dropResultIfNeeded = this.expression(expression, Valtype.f32);
                if (includeDrop &&
                    expression.type != 'LogicalExpression' &&
                    expression.type != 'AssignmentExpression' &&
                    dropResultIfNeeded) {
                    this.codes.push(Opcodes.drop);
                }
            }
        };
        this.expression = (expression, valType) => {
            switch (expression.type) {
                case 'Identifier':
                    if (expression.name) {
                        if (this.externalValues[expression.name] !== undefined) {
                        }
                        else if (this.variableStore[expression.name] !== undefined) {
                            let variableIndex = this.localVarablesList.indexOf(expression.name);
                            if (variableIndex >= 0) {
                                this.codes.push(Opcodes.get_local);
                                this.codes.push(...unsignedLEB128(variableIndex));
                            }
                        }
                        else if (this.localVarablesList.indexOf(expression.name) >= 0) {
                            let variableIndex = this.localVarablesList.indexOf(expression.name);
                            if (variableIndex >= 0) {
                                this.codes.push(Opcodes.get_local);
                                this.codes.push(...unsignedLEB128(variableIndex));
                            }
                        }
                        else {
                            throw new Error(`Unknown variable "${expression.name}" in Expression`);
                        }
                    }
                    else {
                        throw new Error(`Identifier without variable found in Expression`);
                    }
                    break;
                case 'AssignmentExpression':
                    if (expression.operator == '=') {
                        if (expression.left && expression.left.type === 'Identifier') {
                            let valType = Valtype.f32;
                            if (this.variableStore[expression.left.name] !== undefined) {
                                let variableIndex = this.localVarablesList.indexOf(expression.left.name);
                                if (variableIndex >= 0) {
                                    valType = this.localVarablesTypeList[variableIndex];
                                }
                            }
                            else if (this.localVarablesList.indexOf(expression.name) >= 0) {
                                let variableIndex = this.localVarablesList.indexOf(expression.left.name);
                                if (variableIndex >= 0) {
                                    valType = this.localVarablesTypeList[variableIndex];
                                }
                            }
                            this.binaryExpression(expression.right, valType);
                            if (this.externalValues[expression.left.name] !== undefined) {
                            }
                            else if (this.variableStore[expression.left.name] !== undefined) {
                                let variableIndex = this.localVarablesList.indexOf(expression.left.name);
                                if (variableIndex >= 0) {
                                    this.codes.push(Opcodes.set_local);
                                    this.codes.push(...unsignedLEB128(variableIndex));
                                }
                            }
                            else if (this.localVarablesList.indexOf(expression.name) >= 0) {
                                let variableIndex = this.localVarablesList.indexOf(expression.name);
                                if (variableIndex >= 0) {
                                    this.codes.push(Opcodes.set_local);
                                    this.codes.push(...unsignedLEB128(variableIndex));
                                }
                            }
                        }
                    }
                    else if (expression.operator == '+=') {
                        if (expression.left && expression.left.type === 'Identifier') {
                            let valType = Valtype.f32;
                            if (this.variableStore[expression.left.name] !== undefined) {
                                let variableIndex = this.localVarablesList.indexOf(expression.left.name);
                                if (variableIndex >= 0) {
                                    valType = this.localVarablesTypeList[variableIndex];
                                }
                            }
                            else if (this.localVarablesList.indexOf(expression.name) >= 0) {
                                let variableIndex = this.localVarablesList.indexOf(expression.left.name);
                                if (variableIndex >= 0) {
                                    valType = this.localVarablesTypeList[variableIndex];
                                }
                            }
                            let initialValue = 0;
                            if (this.externalValues[expression.left.name] !== undefined) {
                            }
                            else if (this.variableStore[expression.left.name] !== undefined) {
                                let variableIndex = this.localVarablesList.indexOf(expression.name);
                                if (variableIndex >= 0) {
                                    this.codes.push(Opcodes.get_local);
                                    this.codes.push(...unsignedLEB128(variableIndex));
                                }
                            }
                            this.binaryExpression(expression.right, valType);
                            if (this.externalValues[expression.left.name] !== undefined) {
                            }
                            else if (this.variableStore[expression.left.name] !== undefined) {
                                let variableIndex = this.localVarablesList.indexOf(expression.left.name);
                                if (variableIndex >= 0) {
                                    this.codes.push(Opcodes.set_local);
                                    this.codes.push(...unsignedLEB128(variableIndex));
                                }
                            }
                            else if (this.localVarablesList.indexOf(expression.left.name) >= 0) {
                                let variableIndex = this.localVarablesList.indexOf(expression.left.name);
                                if (variableIndex >= 0) {
                                    this.codes.push(Opcodes.set_local);
                                    this.codes.push(...unsignedLEB128(variableIndex));
                                }
                            }
                            else {
                                throw new Error(`Unknown variable "${expression.name}" in Expression`);
                            }
                        }
                    }
                    break;
                case 'BinaryExpression':
                    this.binaryExpression(expression.left, valType);
                    this.binaryExpression(expression.right, valType);
                    if (expression.operator === '+') {
                        this.codes.push(valType == Valtype.f32 ? Opcodes.f32_add : Opcodes.i32_add);
                    }
                    else if (expression.operator === '-') {
                        this.codes.push(valType == Valtype.f32 ? Opcodes.f32_sub : Opcodes.i32_sub);
                    }
                    else if (expression.operator === '*') {
                        this.codes.push(valType == Valtype.f32 ? Opcodes.f32_mul : Opcodes.i32_mul);
                    }
                    else if (expression.operator === '/') {
                        this.codes.push(valType == Valtype.f32 ? Opcodes.f32_div : Opcodes.i32_div_s);
                    }
                    else if (expression.operator === '==') {
                        this.codes.push(valType == Valtype.f32 ? Opcodes.f32_eq : Opcodes.i32_eq);
                    }
                    else if (expression.operator === '!=') {
                        this.codes.push(valType == Valtype.f32 ? Opcodes.f32_ne : Opcodes.i32_ne);
                    }
                    else if (expression.operator === '>=') {
                        this.codes.push(valType == Valtype.f32 ? Opcodes.f32_ge : Opcodes.i32_ge);
                    }
                    else if (expression.operator === '<=') {
                        this.codes.push(valType == Valtype.f32 ? Opcodes.f32_le : Opcodes.i32_le);
                    }
                    else if (expression.operator === '>') {
                        this.codes.push(valType == Valtype.f32 ? Opcodes.f32_gt : Opcodes.i32_gt);
                    }
                    else if (expression.operator === '<') {
                        this.codes.push(valType == Valtype.f32 ? Opcodes.f32_lt : Opcodes.i32_lt);
                    }
                    else {
                        throw new Error(`Unknown operator "${expression.operator}" found in BinaryExpression`);
                    }
                    break;
                case 'LogicalExpression':
                    this.binaryExpression(expression.left, valType);
                    this.binaryExpression(expression.right, valType);
                    if (expression.operator === '&&') {
                        this.codes.push(Opcodes.i32_and);
                    }
                    else if (expression.operator === '||') {
                        this.codes.push(Opcodes.i32_or);
                    }
                    break;
                case 'CallExpression':
                    return this.callExpression(expression, valType);
            }
            return true;
        };
        this.callExpression = (expressionNode, valType) => {
            let _valType = valType;
            if (expressionNode.callee.name == 'storeHex') {
                _valType = Valtype.i32;
                if (expressionNode.arguments.length != 2) {
                    throw new Error(`store requires 2 parameters, ${expressionNode.arguments.length} given`);
                }
                expressionNode.arguments.map((argumentExpression) => {
                    this.binaryExpression(argumentExpression, _valType);
                });
                this.codes.push(Opcodes.i32_const);
                this.codes.push(...unsignedLEB128(255));
                this.codes.push(Opcodes.i32_const);
                this.codes.push(...unsignedLEB128(24));
                this.codes.push(Opcodes.i32_shl);
                this.codes.push(Opcodes.i32_or);
            }
            else if (expressionNode.callee.name == 'store') {
                _valType = Valtype.i32;
                if (expressionNode.arguments.length != 4) {
                    throw new Error(`store requires 4 parameters, ${expressionNode.arguments.length} given`);
                }
                expressionNode.arguments.map((argumentExpression) => {
                    this.binaryExpression(argumentExpression, _valType);
                });
                this.codes.push(Opcodes.i32_const);
                this.codes.push(...unsignedLEB128(8));
                this.codes.push(Opcodes.i32_shl);
                this.codes.push(Opcodes.i32_or);
                this.codes.push(Opcodes.i32_const);
                this.codes.push(...unsignedLEB128(8));
                this.codes.push(Opcodes.i32_shl);
                this.codes.push(Opcodes.i32_or);
                this.codes.push(Opcodes.i32_const);
                this.codes.push(...unsignedLEB128(255));
                this.codes.push(Opcodes.i32_const);
                this.codes.push(...unsignedLEB128(24));
                this.codes.push(Opcodes.i32_shl);
                this.codes.push(Opcodes.i32_or);
            }
            else {
                let functionDeclaration = this.functionCode.filter(declaration => {
                    return declaration.name == expressionNode.callee.name;
                });
                if (functionDeclaration.length > 0) {
                    if (expressionNode.arguments.length != functionDeclaration[0].paramCount) {
                        throw new Error(`Function ${functionDeclaration[0].name} expected ${functionDeclaration[0].paramCount} parameters but ${expressionNode.arguments.length} given`);
                    }
                }
                expressionNode.arguments.map((argumentExpression, index) => {
                    let paramType = _valType;
                    if (functionDeclaration.length > 0) {
                        if (index < functionDeclaration[0].localVarablesTypeList.length) {
                            paramType = functionDeclaration[0].localVarablesTypeList[index];
                        }
                    }
                    this.binaryExpression(argumentExpression, paramType);
                });
            }
            if (expressionNode.callee.name == 'convert_signed_i32_to_f32') {
                if (expressionNode.arguments.length != 1) {
                    throw new Error(`convert_signed_i32_to_f32 requires 1 parameter, ${expressionNode.arguments.length} given`);
                }
                this.codes.push(Opcodes.f32_convert_i32_s);
            }
            else if (expressionNode.callee.name == 'trunc_signed_f32_to_i32') {
                if (expressionNode.arguments.length != 1) {
                    throw new Error(`trunc_signed_f32_to_i32 requires 1 parameter, ${expressionNode.arguments.length} given`);
                }
                this.codes.push(Opcodes.i32_trunc_f32_s);
            }
            else if (expressionNode.callee.name == 'storeHex') {
                if (expressionNode.arguments.length != 2) {
                    throw new Error(`store requires 2 parameters, ${expressionNode.arguments.length} given`);
                }
                this.codes.push(Opcodes.i32_store);
                this.codes.push(...unsignedLEB128(2));
                this.codes.push(...unsignedLEB128(0));
                return false;
            }
            else if (expressionNode.callee.name == 'store') {
                if (expressionNode.arguments.length != 4) {
                    throw new Error(`store requires 4 parameters, ${expressionNode.arguments.length} given`);
                }
                this.codes.push(Opcodes.i32_store);
                this.codes.push(...unsignedLEB128(2));
                this.codes.push(...unsignedLEB128(0));
                return false;
            }
            else if (expressionNode.callee.name == 'sqrt') {
                if (expressionNode.arguments.length != 1) {
                    throw new Error(`sqrt requires 1 parameter, ${expressionNode.arguments.length} given`);
                }
                this.codes.push(Opcodes.f32_sqrt);
            }
            else {
                this.codes.push(Opcodes.call);
                let functionIndex = this.functionList.indexOf(expressionNode.callee.name) + 2;
                if (expressionNode.callee.name === 'sin') {
                    functionIndex = 0;
                }
                if (functionIndex >= 0) {
                    this.codes.push(...unsignedLEB128(functionIndex));
                }
            }
            return true;
        };
        this.binaryExpression = (expressionNode, valType) => {
            switch (expressionNode.type) {
                case 'LogicalExpression':
                    this.expression(expressionNode, valType);
                    break;
                case 'CallExpression':
                    this.callExpression(expressionNode, valType);
                    break;
                case 'BinaryExpression':
                    this.expression(expressionNode, valType);
                    break;
                case 'NumberLiteral':
                    if (valType == Valtype.i32) {
                        this.codes.push(Opcodes.i32_const);
                        this.codes.push(...unsignedLEB128(expressionNode.value | 0));
                    }
                    else {
                        this.codes.push(Opcodes.f32_const);
                        this.codes.push(...ieee754(expressionNode.value));
                    }
                    break;
                case 'Identifier':
                    if (expressionNode.name) {
                        if (this.externalValues[expressionNode.name] !== undefined) {
                        }
                        else if (this.variableStore[expressionNode.name] !== undefined) {
                            let variableIndex = this.localVarablesList.indexOf(expressionNode.name);
                            if (variableIndex >= 0) {
                                this.codes.push(Opcodes.get_local);
                                this.codes.push(...unsignedLEB128(variableIndex));
                            }
                        }
                        else if (this.localVarablesList.indexOf(expressionNode.name) >= 0) {
                            let variableIndex = this.localVarablesList.indexOf(expressionNode.name);
                            if (variableIndex >= 0) {
                                this.codes.push(Opcodes.get_local);
                                this.codes.push(...unsignedLEB128(variableIndex));
                            }
                        }
                        else {
                            throw new Error(`Unknown variable "${expressionNode.name}" in BinaryExpression`);
                        }
                    }
                    else {
                        throw new Error(`Identifier without variable found in BinaryExpression`);
                    }
                    break;
            }
        };
        this.variableStatement = (variableNode) => {
            if (variableNode.declarations) {
                variableNode.declarations.map((variableDeclaration) => {
                    if (variableDeclaration.type === 'VariableDeclaration') {
                        if (variableDeclaration.id && variableDeclaration.id.type === 'Identifier') {
                            if (variableDeclaration.init && variableDeclaration.init.type === 'NumberLiteral') {
                                if (this.inputVariables.indexOf(variableDeclaration.id.name) >= 0) {
                                    throw new Error(`Trying to redeclare payload input parameter "${variableDeclaration.id.name}"`);
                                }
                                if (['x', 'y', 'time', 'index', 'width', 'height'].indexOf(variableDeclaration.id.name) >= 0) {
                                    throw new Error(`Trying to redeclare function input parameter "${variableDeclaration.id.name}"`);
                                }
                                this.variableStore[variableDeclaration.id.name] = variableDeclaration.init.value;
                                if (variableNode.variableType == 'i32') {
                                    this.variableStoreTypes[variableDeclaration.id.name] = Valtype.i32;
                                    this.localVarablesTypeList.push(Valtype.i32);
                                    this.localVarablesList.push(variableDeclaration.id.name);
                                    this.codes.push(Opcodes.i32_const);
                                    this.codes.push(...unsignedLEB128(variableDeclaration.init.value | 0));
                                    this.codes.push(Opcodes.set_local);
                                    this.codes.push(...unsignedLEB128(this.localVarablesList.length - 1));
                                }
                                else {
                                    this.variableStoreTypes[variableDeclaration.id.name] = Valtype.f32;
                                    this.localVarablesTypeList.push(Valtype.f32);
                                    this.localVarablesList.push(variableDeclaration.id.name);
                                    this.codes.push(Opcodes.f32_const);
                                    this.codes.push(...ieee754(variableDeclaration.init.value));
                                    this.codes.push(Opcodes.set_local);
                                    this.codes.push(...unsignedLEB128(this.localVarablesList.length - 1));
                                }
                            }
                            else {
                                throw new Error('Variable initializer can only be a number.');
                            }
                        }
                    }
                });
            }
        };
    }
}
//# sourceMappingURL=compiler.js.map