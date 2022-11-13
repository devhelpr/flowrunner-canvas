import { createExpressionTree, executeExpressionTree } from '@devhelpr/expressionrunner';
import { FlowTask, FlowTaskPackageType } from '@devhelpr/flowrunner';
import { isVariable, setVariableValue } from '../flow-variables';

const convertGridToNamedVariables = (values: any[]) => {
  let variables: any = {};
  values.map((rowValues: any, rowIndex: number) => {
    if (rowValues) {
      rowValues.map((cellValue: any, columnIndex: number) => {
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
  private compiledExpressionTree: any = undefined;
  private expression: string = '';

  public override execute(node: any, services: any) {
    if (!node.assignToProperty) {
      return false;
    }
    return new Promise((resolve, reject) => {
      if (node.expression !== 'undefined' && node.expression !== '') {
        const isFromVariableStore = isVariable(node.assignToProperty);
        console.log('isFromVariableStore', isFromVariableStore, node.assignToProperty);
        if (!this.compiledExpressionTree || this.expression !== node.expression) {
          this.compiledExpressionTree = createExpressionTree(node.expression);
          this.expression = node.expression;
        }

        let payload: any = {};

        // force properties to number
        if (node.forceNumeric === true) {
          for (const property in node.payload) {
            if (node.payload.hasOwnProperty(property)) {
              if (typeof node.payload[property] == 'string') {
                payload[property] = parseFloat(node.payload[property]) || 0;
              } else {
                payload[property] = node.payload[property];
              }
            }
          }
        } else {
          payload = node.payload;
        }

        if (!isFromVariableStore && node.assignToProperty) {
          // const matches = node.expression.match(/^\w+/g);
          // if (node.assignToProperty) {
          //   matches.forEach((match) => {
          //     const currentValue = services.flowEventRunner.getPropertyFromNode(node.name, match);

          //     if (node.forceNumeric === true) {
          //       payload[match] = parseFloat(currentValue) || 0;
          //     } else {
          //       payload[match] = currentValue;
          //     }
          //   });
          // }
          const currentValue = node.noLocalState
            ? 0
            : services.flowEventRunner.getPropertyFromNode(node.name, node.assignToProperty);

          if (node.forceNumeric === true) {
            payload[node.assignToProperty] =
              parseFloat(currentValue) || (node.assignToProperty && parseFloat(payload[node.assignToProperty])) || 0;
          } else {
            payload[node.assignToProperty] = currentValue || payload[node.assignToProperty] || '';
          }
        }

        if (payload.values) {
          let values = convertGridToNamedVariables(payload.values);
          payload = { ...payload, ...values };
        }
        try {
          //console.log('expression', node.forceNumeric, payload, this.compiledExpressionTree);
          const result = executeExpressionTree(this.compiledExpressionTree, payload || {});
          if (node.mode && node.mode === 'numeric' && (isNaN(result) || result === 'undefined')) {
            console.log('ExpressionTask - result is NaN/undefined', result);
            reject();
          } else {
            let resultToPayload = result;
            if (node.rounding && node.rounding === 'floor') {
              resultToPayload = Math.floor(resultToPayload);
            }

            if (isFromVariableStore) {
              console.log('setVariableValue', result);
              setVariableValue(node.assignToProperty, result);
            } else if (node.assignAsPropertyFromObject !== undefined && node.assignAsPropertyFromObject !== '') {
              node.payload[node.assignAsPropertyFromObject][node.assignToProperty] = resultToPayload;
            } else {
              if (!node.noLocalState) {
                services.flowEventRunner.setPropertyOnNode(node.name, node.assignToProperty, resultToPayload);
              }
              node.payload[node.assignToProperty] = resultToPayload;
            }

            resolve(node.payload);
          }
        } catch (err) {
          console.log('ExpressionTask - error', err);
          reject();
        }
      } else {
        reject();
      }
    });
  }

  public override getDescription() {
    return 'Node that executes an expression';
  }

  public override getName() {
    return 'ExpressionTask';
  }

  public override getFullName() {
    return 'Expression';
  }

  public override getIcon() {
    return 'expression';
  }

  public override getShape() {
    return 'rect';
  }

  public override getDefaultColor() {
    return '#00ff80ff';
  }

  public override getTaskType() {
    return 'both';
  }

  public override getPackageType() {
    return FlowTaskPackageType.DEFAULT_NODE;
  }

  public override getCategory() {
    return 'FlowCanvas';
  }

  public override getController() {
    return 'FlowCanvasController';
  }

  public override getConfigMetaData() {
    return [
      { name: 'assignToProperty', defaultValue: '', valueType: 'string', required: true },
      { name: 'assignAsPropertyFromObject', defaultValue: '', valueType: 'string', required: false },
      { name: 'expression', defaultValue: '', valueType: 'string', required: false },
      { name: 'forceNumeric', defaultValue: false, valueType: 'boolean', required: false },
    ];
  }
}
