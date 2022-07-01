import { FlowTask } from '@devhelpr/flowrunner';
export class SvgTestTask extends FlowTask {
    execute(node, services) {
        return node.payload;
    }
    getName() {
        return 'SvgTestTask';
    }
}
//# sourceMappingURL=svg-test-task.js.map