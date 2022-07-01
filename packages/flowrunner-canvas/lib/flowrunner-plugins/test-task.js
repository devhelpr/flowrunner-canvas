import { FlowTask } from '@devhelpr/flowrunner';
export class TestTask extends FlowTask {
    execute(node, services) {
        return node.payload;
    }
    getName() {
        return 'TestTask';
    }
}
//# sourceMappingURL=test-task.js.map