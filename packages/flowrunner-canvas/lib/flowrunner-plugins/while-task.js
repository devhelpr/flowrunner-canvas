import { FlowTask } from '@devhelpr/flowrunner';
export class WhileTask extends FlowTask {
    execute(node, services) {
        return node.payload;
    }
    getName() {
        return 'WhileTask';
    }
}
//# sourceMappingURL=while-task.js.map