import { FlowTask } from '@devhelpr/flowrunner';
import { createExpressionTree, executeExpressionTree, extractValueParametersFromExpressionTree, getRangeValueParameters, isRangeValue, } from '@devhelpr/expressionrunner';
export class DataGridTask extends FlowTask {
    constructor() {
        super(...arguments);
        this.convertGridToNamedVariables = (values) => {
            let variables = {};
            values.map((rowValues, rowIndex) => {
                if (rowValues) {
                    rowValues.map((cellValue, columnIndex) => {
                        if (cellValue) {
                            if (cellValue === '' || (cellValue != '' && cellValue[0] !== '=')) {
                                let letter = String.fromCharCode((columnIndex % 26) + 65);
                                let value = Number(cellValue);
                                if (isNaN(value) || isNaN(cellValue)) {
                                    value = cellValue;
                                }
                                variables[letter + (rowIndex + 1)] = value;
                            }
                        }
                    });
                }
            });
            return variables;
        };
    }
    execute(node, services) {
        try {
            let payload = Object.assign({}, node.payload);
            let promises = [];
            let infoCells = [];
            let values = [];
            if (node.values) {
                let variables = { ...payload, values: node.values, ...this.convertGridToNamedVariables(node.values) };
                node.values.map((rowValues, rowIndex) => {
                    if (rowValues) {
                        values.push([...rowValues]);
                        rowValues.map((cellValue, columnIndex) => {
                            if (cellValue && cellValue != '') {
                                if (cellValue[0] === '=') {
                                    let tree = createExpressionTree(cellValue.substring(1));
                                    let letter = String.fromCharCode((columnIndex % 26) + 65);
                                    infoCells.push({
                                        name: letter + (rowIndex + 1),
                                        row: rowIndex,
                                        column: columnIndex,
                                        expressionTree: tree,
                                        valueParameters: extractValueParametersFromExpressionTree(tree),
                                    });
                                }
                            }
                        });
                    }
                });
                infoCells.map(infoCell => {
                    let includeParameters = [];
                    infoCell.valueParameters.map(valueParameter => {
                        if (isRangeValue(valueParameter)) {
                            includeParameters = getRangeValueParameters(valueParameter);
                        }
                        return true;
                    });
                    infoCell.valueParameters.push(includeParameters);
                    return true;
                });
                infoCells.sort((a, b) => {
                    const aIsAValueParameterOfB = b.valueParameters.indexOf(a.name) >= 0;
                    const bIsAValueParameterOfA = a.valueParameters.indexOf(b.name) >= 0;
                    if (aIsAValueParameterOfB && bIsAValueParameterOfA) {
                        throw new Error('Cirular reference found ' + a.name + ' and ' + b.name);
                    }
                    if (aIsAValueParameterOfB) {
                        return -1;
                    }
                    if (bIsAValueParameterOfA) {
                        return 1;
                    }
                    return 0;
                });
                const promise = new Promise((resolve, reject) => {
                    try {
                        infoCells.map(infoCell => {
                            const value = executeExpressionTree(infoCell.expressionTree, variables || {});
                            variables[infoCell.name] = value;
                            return true;
                        });
                        infoCells.map(infoCell => {
                            let row = [...values[infoCell.row]];
                            row[infoCell.column] = variables[infoCell.name];
                            values[infoCell.row] = row;
                            return true;
                        });
                        if (node.nameSpace) {
                            payload[node.nameSpace] = values;
                        }
                        else {
                            payload.values = values;
                        }
                        resolve(payload);
                    }
                    catch (err) {
                        console.log('DataGridTask exception when executing expressions', err);
                    }
                });
                return promise;
            }
            else {
                return false;
            }
        }
        catch (err) {
            console.log('DataGridTask exception', err);
            return false;
        }
    }
    getName() {
        return 'DataGridTask';
    }
}
//# sourceMappingURL=data-grid-task.js.map