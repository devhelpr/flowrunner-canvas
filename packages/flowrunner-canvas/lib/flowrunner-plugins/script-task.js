import { FlowTask } from '@devhelpr/flowrunner';
export class ScriptTask extends FlowTask {
    execute(node, services) {
        let payload = { ...node.payload };
        if (node.outputProperty && node.script) {
            payload[node.outputProperty] = node.script;
        }
        return payload;
    }
    getName() {
        return 'ScriptTask';
    }
}
//# sourceMappingURL=script-task.js.map