import { FlowTask } from '@devhelpr/flowrunner';
export class FilterDataGridTask extends FlowTask {
    execute(node, services) {
        let payload = { ...node.payload };
        if (node.filterColumn && node.filterValueFromProperty && payload.values) {
            if (payload[node.filterValueFromProperty]) {
                let searchValue = payload[node.filterValueFromProperty];
                let columnIndex = (node.filterColumn[0] || 'A').charCodeAt(0) - 65;
                payload.values = payload.values.filter(row => {
                    return row[columnIndex] == searchValue;
                });
            }
        }
        return payload;
    }
    getName() {
        return 'FilterDataGridTask';
    }
}
//# sourceMappingURL=filter-datagrid-task.js.map