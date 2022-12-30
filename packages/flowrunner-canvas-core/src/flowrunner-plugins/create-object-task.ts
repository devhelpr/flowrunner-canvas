import { createExpressionTree, executeExpressionTree } from '@devhelpr/expressionrunner';
import { FlowTask, FlowTaskPackageType } from '@devhelpr/flowrunner';
import { getPropertyByNamespacedName } from '../helpers/namespaced-properties';

export class CreateObjectTask extends FlowTask {
  private compiledExpressionTree: any[] = [];
  private expressions: string[] = [];
  private objectListExpression: string[] = [];

  public override execute(node: any, services: any) {
    if (!node.assignToProperty || !node.properties || node.properties.length === 0) {
      return node.payload;
    }

    return new Promise((resolve, reject) => {
      if (node.assignToProperty) {
        this.compiledExpressionTree = [];
        this.expressions = [];
        node.properties.forEach((item) => {
          this.compiledExpressionTree.push(createExpressionTree(item.expression));
          this.expressions.push(item.expression);
        });
        this.objectListExpression = node.properties;

        let payload: any = {};
        payload = node.payload;
        let numericPayload: any = {};
        for (const property in node.payload) {
          if (node.payload.hasOwnProperty(property)) {
            if (typeof node.payload[property] == 'string') {
              numericPayload[property] = parseFloat(node.payload[property]) || 0;
            } else {
              numericPayload[property] = node.payload[property];
            }
          }
        }

        try {
          const object: any = {};
          this.compiledExpressionTree.forEach((compiledExpressionTree, index) => {
            const params = node.properties[index];
            if (params.propertyName) {
              let result = executeExpressionTree(
                compiledExpressionTree,
                (!!params.foreceNumeric ? numericPayload : payload) || {},
              );
              if (params.mode && params.mode === 'numeric' && (isNaN(result) || result === 'undefined')) {
                console.log('CreateListTask - result is NaN/undefined', result);
                reject();
              } else {
                if (params.rounding && params.rounding === 'floor') {
                  result = Math.floor(result);
                }
                object[params.propertyName] = result;
              }
            }
          });
          node.payload[node.assignToProperty] = object;
          resolve(node.payload);
        } catch (err) {
          console.log('CreateObjectTask - error', err);
          reject();
        }
      } else {
        console.log('CreateObjectTask - error - not all required params available');
        reject();
      }
    });
  }

  public override getDescription() {
    return 'Node that creates an object based on expressions';
  }

  public override getName() {
    return 'CreateObjectTask';
  }
}
