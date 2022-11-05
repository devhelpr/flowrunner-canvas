import { createExpressionTree, executeExpressionTree } from '@devhelpr/expressionrunner';
import { FlowTask, FlowTaskPackageType } from '@devhelpr/flowrunner';

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

export class CreateListTask extends FlowTask {
  private compiledExpressionTree: any[] = [];
  private expressions: string[] = [];
  private listExpression: string = '';

  public override execute(node: any, services: any) {
    return new Promise((resolve, reject) => {
      if (node.assignToProperty && node.listExpression !== 'undefined' && node.listExpression !== '') {
        if (this.compiledExpressionTree.length === 0 || this.listExpression !== node.listExpression) {
          this.compiledExpressionTree = [];
          this.expressions = [];
          (node.listExpression as unknown as string).split(',').forEach((expression) => {
            console.log('CreateListTask sub expression', expression);
            this.compiledExpressionTree.push(createExpressionTree(expression));
            this.expressions.push(expression);
          });
          this.listExpression = node.listExpression;
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

        if (payload.values) {
          let values = convertGridToNamedVariables(payload.values);
          payload = { ...payload, ...values };
        }
        try {
          console.log('CreateListList', this.expressions, payload, this.compiledExpressionTree);
          const list: any[] = [];
          this.compiledExpressionTree.forEach((compiledExpressionTree) => {
            const result = executeExpressionTree(compiledExpressionTree, payload || {});
            if (node.mode && node.mode === 'numeric' && (isNaN(result) || result === 'undefined')) {
              console.log('CreateListTask - result is NaN/undefined', result);
              reject();
              return;
            } else {
              let resultToPayload = result;
              if (node.rounding && node.rounding === 'floor') {
                resultToPayload = Math.floor(resultToPayload);
              }
              list.push(resultToPayload);
            }
          });
          node.payload[node.assignToProperty] = list;
          resolve(node.payload);
        } catch (err) {
          console.log('CreateListTask - error', err);
          reject();
        }
      } else {
        console.log('CreateListTask - error - not all required params available');
        reject();
      }
    });
  }

  public override getDescription() {
    return 'Node that creates a list based on expressions';
  }

  public override getName() {
    return 'CreateListTask';
  }
}
