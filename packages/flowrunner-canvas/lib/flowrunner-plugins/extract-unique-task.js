import { FlowTask } from '@devhelpr/flowrunner';
export class ExtractUniqueTask extends FlowTask {
    execute(node, services) {
        let payload = { ...node.payload };
        if (node.sourceProperty && node.outputProperty) {
            if (payload[node.sourceProperty] && Array.isArray(payload[node.sourceProperty])) {
                let data = [];
                payload[node.sourceProperty].map(item => {
                    if (typeof item == 'object') {
                        if (node.extractFromProperty && item[node.extractFromProperty] !== undefined) {
                            if (data.indexOf(item[node.extractFromProperty]) < 0) {
                                data.push(item[node.extractFromProperty]);
                            }
                        }
                    }
                    else {
                        if (data.indexOf(item) < 0) {
                            data.push(item);
                        }
                    }
                });
                if (!!node.isOutputForDropdown) {
                    payload[node.outputProperty] = data.map(item => {
                        return {
                            label: item,
                            value: item,
                        };
                    });
                }
                else {
                    payload[node.outputProperty] = data;
                }
            }
        }
        return payload;
    }
    getName() {
        return 'ExtractUniqueTask';
    }
}
//# sourceMappingURL=extract-unique-task.js.map