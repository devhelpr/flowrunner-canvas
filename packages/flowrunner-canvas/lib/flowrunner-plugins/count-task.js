import { FlowTask } from '@devhelpr/flowrunner';
export class CountTask extends FlowTask {
    execute(node, services) {
        let payload = { ...node.payload };
        if (node.outputProperty && node.arrayProperty && Array.isArray(payload[node.arrayProperty])) {
            payload[node.outputProperty] = payload[node.arrayProperty].length;
        }
        return payload;
    }
    getName() {
        return 'CountTask';
    }
}
//# sourceMappingURL=count-task.js.map