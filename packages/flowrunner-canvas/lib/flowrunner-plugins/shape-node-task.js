import { FlowTask } from '@devhelpr/flowrunner';
export class ShapeNodeTask extends FlowTask {
    execute(node, services) {
        return node.payload;
    }
    getName() {
        return 'ShapeNodeTask';
    }
}
//# sourceMappingURL=shape-node-task.js.map