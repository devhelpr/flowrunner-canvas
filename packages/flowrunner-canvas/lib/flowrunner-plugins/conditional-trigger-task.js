import { FlowTask } from '@devhelpr/flowrunner';
export class ConditionalTriggerTask extends FlowTask {
    execute(node, services) {
        try {
            if (node.propertyName) {
                if (node.minValue && node.maxValue) {
                    let value = node.payload[node.propertyName];
                    if (!isNaN(value)) {
                        if (value >= node.minValue && value < node.maxValue) {
                            return Object.assign({}, node.payload);
                        }
                    }
                }
            }
        }
        catch (err) {
            console.log('ConditionalTriggerTask error', err);
        }
        let errors = [];
        errors.push({
            error: node.name + ' failed',
            name: node.name,
        });
        const payload = Object.assign({}, node.payload, {
            errors,
            followFlow: 'isError',
        });
        return payload;
    }
    getName() {
        return 'ConditionalTriggerTask';
    }
}
//# sourceMappingURL=conditional-trigger-task.js.map