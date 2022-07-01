import { FlowTask } from '@devhelpr/flowrunner';
export class SortTask extends FlowTask {
    constructor() {
        super(...arguments);
        this.sort = (data, compareField, mode) => {
            return data.sort((a, b) => {
                if (mode == 'ascending') {
                    if (a[compareField] < b[compareField]) {
                        return -1;
                    }
                    if (a[compareField] > b[compareField]) {
                        return 1;
                    }
                }
                else {
                    if (a[compareField] > b[compareField]) {
                        return -1;
                    }
                    if (a[compareField] < b[compareField]) {
                        return 1;
                    }
                }
                return 0;
            });
        };
    }
    execute(node, services) {
        let payload = { ...node.payload };
        if (node.sortProperty && node.mode && node.compareField) {
            if (payload[node.sortProperty]) {
                payload[node.sortProperty] = this.sort(payload[node.sortProperty], node.compareField, node.mode);
            }
        }
        return payload;
    }
    getName() {
        return 'SortTask';
    }
}
//# sourceMappingURL=sort-task.js.map