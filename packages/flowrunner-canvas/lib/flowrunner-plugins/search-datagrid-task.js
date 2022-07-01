import { FlowTask } from '@devhelpr/flowrunner';
export class SearchDataGridTask extends FlowTask {
    execute(node, services) {
        let payload = { ...node.payload };
        if (node.searchColumn &&
            node.searchValueFromProperty &&
            node.outputProperty &&
            node.outputColumn &&
            payload.values) {
            if (payload[node.searchValueFromProperty]) {
                let searchValue = payload[node.searchValueFromProperty];
                let columnIndex = (node.searchColumn[0] || 'A').charCodeAt(0) - 65;
                let outputColumnIndex = (node.outputColumn[0] || 'A').charCodeAt(0) - 65;
                let returnValue;
                payload.values.map(row => {
                    if (row[columnIndex] == searchValue) {
                        returnValue = row[outputColumnIndex];
                    }
                });
                if (returnValue) {
                    payload[node.outputProperty] = returnValue;
                }
            }
        }
        return payload;
    }
    getName() {
        return 'SearchDataGridTask';
    }
}
//# sourceMappingURL=search-datagrid-task.js.map