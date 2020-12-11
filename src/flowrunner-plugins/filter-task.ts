import { FlowTask } from '@devhelpr/flowrunner';

import {
  createExpressionTree,
  executeExpressionTree
} from '@devhelpr/expressionrunner';

export class FilterTask extends FlowTask {
  
  expression : string = "";
  expressionTree : any = undefined;

  public execute(node: any, services: any) {
    let payload = { ...node.payload };
    if (node.expression && (this.expression !== node.expression || !this.expressionTree)) {
      this.expression = node.expression;
      this.expressionTree = createExpressionTree(node.expression);
    }
    if (node.sourceProperty && node.outputProperty && node.expression) {
      if (payload[node.sourceProperty] && Array.isArray(payload[node.sourceProperty])) {
        let data : any[] = [];
        payload[node.sourceProperty].map((item) => {
          const result = executeExpressionTree(this.expressionTree, {...payload,...item});
          if (result == 1) {
            data.push(item);
          }
        });
        payload[node.outputProperty] = data;
      }
    }
    return payload;
  }

  public getName() {
    return 'FilterTask';
  }    
}
