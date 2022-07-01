import { FlowTask } from '@devhelpr/flowrunner';
export class MultiFormTask extends FlowTask {
    execute(node, services) {
        let payload = { ...node.payload };
        return payload;
    }
    getName() {
        return 'MultiFormTask';
    }
}
//# sourceMappingURL=multi-form-task.js.map