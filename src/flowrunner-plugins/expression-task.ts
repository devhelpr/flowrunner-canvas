import { createExpressionTree, executeExpressionTree } from '@devhelpr/expressionrunner';
import { FlowTask, FlowTaskPackageType } from '@devhelpr/flowrunner';

export class ExpressionTask extends FlowTask {
  private compiledExpressionTree: any = undefined;
  private expression: string = '';

  public execute(node: any, services: any) {
    return new Promise((resolve, reject) => {
      if (node.expression !== 'undefined' && node.expression !== '') {
        if (!this.compiledExpressionTree || this.expression !== node.expression) {
          this.compiledExpressionTree = createExpressionTree(node.expression);
          this.expression = node.expression;
        }
        // force properties to number
        let payload: any = {};
        if (node.forceNumeric === true) {
          for (const property in node.payload) {
            if (node.payload.hasOwnProperty(property)) {
              payload[property] = parseFloat(node.payload[property]) || 0;
            }
          }
        } else {
          payload = node.payload;
        }
        try {
          const result = executeExpressionTree(this.compiledExpressionTree, payload || {});
          if (node.mode && node.mode === 'numeric' && (isNaN(result) || result === 'undefined')) {
            console.log('ExpressionTask - result is NaN/undefined', result);
            reject();
          } else {
            let resultToPayload = result;
            if (node.rounding && node.rounding === 'floor') {
              resultToPayload = Math.floor(resultToPayload);
            }

            if (node.assignAsPropertyFromObject !== undefined && node.assignAsPropertyFromObject !== '') {
              node.payload[node.assignAsPropertyFromObject][node.assignToProperty] = resultToPayload;
            } else {
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

  public getDescription() {
    return 'Node that executes an expression';
  }

  public getName() {
    return 'ExpressionTask';
  }

  public getFullName() {
    return 'Expression';
  }

  public getIcon() {
    return 'expression';
  }

  public getShape() {
    return 'rect';
  }

  public getDefaultColor() {
    return '#00ff80ff';
  }

  public getTaskType() {
    return 'both';
  }

  public getPackageType() {
    return FlowTaskPackageType.DEFAULT_NODE;
  }

  public getCategory() {
    return 'FlowCanvas';
  }

  public getController() {
    return 'FlowCanvasController';
  }

  public getConfigMetaData() {
    return [
      { name: 'assignToProperty', defaultValue: '', valueType: 'string', required: true },
      { name: 'assignAsPropertyFromObject', defaultValue: '', valueType: 'string', required: false },
      { name: 'expression', defaultValue: '', valueType: 'string', required: false },
      { name: 'forceNumeric', defaultValue: false, valueType: 'boolean', required: false },
    ];
  }
}
