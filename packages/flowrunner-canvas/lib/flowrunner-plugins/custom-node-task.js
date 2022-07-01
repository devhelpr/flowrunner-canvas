import { FlowTask } from '@devhelpr/flowrunner';
export class CustomNodeTask extends FlowTask {
    execute(node, services) {
        return node.payload;
    }
    getName() {
        return 'CustomNodeTask';
    }
}
//# sourceMappingURL=custom-node-task.js.map