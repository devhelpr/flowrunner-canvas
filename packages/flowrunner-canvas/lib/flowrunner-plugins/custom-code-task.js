import { FlowTask } from '@devhelpr/flowrunner';
export class CustomCodeTask extends FlowTask {
    execute(node, services) {
        let payload = { ...node.payload };
        if (node.code && (!this.code || this.code !== node.code)) {
            if (node.mode === 'matrix') {
                this.functionInstance = new Function('t', 'i', 'x', 'y', node.code);
            }
            else {
                if (node.parameters) {
                    this.functionInstance = new Function(...node.parameters, node.code);
                }
            }
        }
        if (this.functionInstance && node.outputProperty) {
            if (node.mode === 'matrix') {
                let result = this.functionInstance(payload.t, payload.i, payload.x, payload.y);
                payload[node.outputProperty] = result;
            }
            else {
            }
        }
        return payload;
    }
    getName() {
        return 'CustomCodeTask';
    }
}
//# sourceMappingURL=custom-code-task.js.map