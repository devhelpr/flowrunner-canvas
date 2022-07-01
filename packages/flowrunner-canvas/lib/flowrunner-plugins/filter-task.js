import { FlowTask } from '@devhelpr/flowrunner';
import { createExpressionTree, executeExpressionTree } from '@devhelpr/expressionrunner';
export class FilterTask extends FlowTask {
    constructor() {
        super(...arguments);
        this.expression = '';
        this.expressionTree = undefined;
    }
    execute(node, services) {
        let payload = { ...node.payload };
        if (node.expression && (this.expression !== node.expression || !this.expressionTree)) {
            this.expression = node.expression;
            this.expressionTree = createExpressionTree(node.expression);
        }
        if (node.sourceProperty && node.outputProperty && node.expression) {
            if (payload[node.sourceProperty] && Array.isArray(payload[node.sourceProperty])) {
                let data = [];
                payload[node.sourceProperty].map(item => {
                    const result = executeExpressionTree(this.expressionTree, { ...payload, ...item });
                    if (result == 1) {
                        data.push(item);
                    }
                });
                payload[node.outputProperty] = data;
            }
        }
        return payload;
    }
    getName() {
        return 'FilterTask';
    }
}
//# sourceMappingURL=filter-task.js.map