import { createExpressionTree, executeExpressionTree } from '@devhelpr/expressionrunner';
import { FlowTask, FlowTaskPackageType } from '@devhelpr/flowrunner';
const convertGridToNamedVariables = (values) => {
    let variables = {};
    values.map((rowValues, rowIndex) => {
        if (rowValues) {
            rowValues.map((cellValue, columnIndex) => {
                if (cellValue) {
                    if (cellValue === '' || (cellValue !== '' && cellValue[0] !== '=')) {
                        let letter = String.fromCharCode((columnIndex % 26) + 65);
                        let value = Number(cellValue);
                        if (isNaN(value)) {
                            value = cellValue;
                        }
                        variables[letter + (rowIndex + 1)] = value;
                    }
                }
                return null;
            });
        }
        return null;
    });
    return variables;
};
export class ExpressionTask extends FlowTask {
    constructor() {
        super(...arguments);
        this.compiledExpressionTree = undefined;
        this.expression = '';
    }
    execute(node, services) {
        return new Promise((resolve, reject) => {
            if (node.expression !== 'undefined' && node.expression !== '') {
                if (!this.compiledExpressionTree || this.expression !== node.expression) {
                    this.compiledExpressionTree = createExpressionTree(node.expression);
                    this.expression = node.expression;
                }
                let payload = {};
                if (node.forceNumeric === true) {
                    for (const property in node.payload) {
                        if (node.payload.hasOwnProperty(property)) {
                            if (typeof node.payload[property] == 'string') {
                                payload[property] = parseFloat(node.payload[property]) || 0;
                            }
                            else {
                                payload[property] = node.payload[property];
                            }
                        }
                    }
                }
                else {
                    payload = node.payload;
                }
                if (payload.values) {
                    let values = convertGridToNamedVariables(payload.values);
                    payload = { ...payload, ...values };
                }
                try {
                    console.log('expression', node.forceNumeric, payload, this.compiledExpressionTree);
                    const result = executeExpressionTree(this.compiledExpressionTree, payload || {});
                    if (node.mode && node.mode === 'numeric' && (isNaN(result) || result === 'undefined')) {
                        console.log('ExpressionTask - result is NaN/undefined', result);
                        reject();
                    }
                    else {
                        let resultToPayload = result;
                        if (node.rounding && node.rounding === 'floor') {
                            resultToPayload = Math.floor(resultToPayload);
                        }
                        if (node.assignAsPropertyFromObject !== undefined && node.assignAsPropertyFromObject !== '') {
                            node.payload[node.assignAsPropertyFromObject][node.assignToProperty] = resultToPayload;
                        }
                        else {
                            node.payload[node.assignToProperty] = resultToPayload;
                        }
                        resolve(node.payload);
                    }
                }
                catch (err) {
                    console.log('ExpressionTask - error', err);
                    reject();
                }
            }
            else {
                reject();
            }
        });
    }
    getDescription() {
        return 'Node that executes an expression';
    }
    getName() {
        return 'ExpressionTask';
    }
    getFullName() {
        return 'Expression';
    }
    getIcon() {
        return 'expression';
    }
    getShape() {
        return 'rect';
    }
    getDefaultColor() {
        return '#00ff80ff';
    }
    getTaskType() {
        return 'both';
    }
    getPackageType() {
        return FlowTaskPackageType.DEFAULT_NODE;
    }
    getCategory() {
        return 'FlowCanvas';
    }
    getController() {
        return 'FlowCanvasController';
    }
    getConfigMetaData() {
        return [
            { name: 'assignToProperty', defaultValue: '', valueType: 'string', required: true },
            { name: 'assignAsPropertyFromObject', defaultValue: '', valueType: 'string', required: false },
            { name: 'expression', defaultValue: '', valueType: 'string', required: false },
            { name: 'forceNumeric', defaultValue: false, valueType: 'boolean', required: false },
        ];
    }
}
//# sourceMappingURL=expression-task.js.map