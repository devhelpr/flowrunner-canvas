import { createExpressionTree, executeExpressionTree } from '@devhelpr/expressionrunner';
import { FlowTask, FlowTaskPackageType } from '@devhelpr/flowrunner';

export class MapPropertiesTask extends FlowTask {
  private compiledExpressionTree: any[] = [];
  private expressions: string[] = [];

  public override execute(node: any, services: any) {
    if (!node.properties || node.properties.length === 0) {
      return node.payload;
    }

    return new Promise((resolve, reject) => {
      this.compiledExpressionTree = [];
      this.expressions = [];
      node.properties.forEach((item) => {
        this.compiledExpressionTree.push(createExpressionTree(item.expression));
        this.expressions.push(item.expression);
      });

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
              reject();
            } else {
              if (params.rounding && params.rounding === 'floor') {
                result = Math.floor(result);
              }
              object[params.propertyName] = result;
            }
          }
        });
        resolve({ ...node.payload, ...object });
      } catch (err) {
        console.log('MapPropertiesTask - error', err);
        reject();
      }
    });
  }

  public override getDescription() {
    return 'Node that maps properties based on expressions';
  }

  public override getName() {
    return 'MapPropertiesTask';
  }
}
