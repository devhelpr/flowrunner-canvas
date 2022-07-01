import { FlowTask } from '@devhelpr/flowrunner';
export class GroupAndSumTask extends FlowTask {
    execute(node, services) {
        let payload = { ...node.payload };
        if (node.outputProperty &&
            node.groupProperty &&
            payload[node.groupProperty] &&
            node.groupBy &&
            node.sumProperties) {
            let list = payload[node.groupProperty];
            if (list) {
                let result = [];
                let grouped = {};
                list.map(listItem => {
                    let groupId = '';
                    node.groupBy.map(groupProperty => {
                        groupId += listItem[groupProperty] || '';
                    });
                    if (grouped[groupId]) {
                        node.sumProperties.map(sumProperty => {
                            grouped[groupId][sumProperty] += listItem[sumProperty] || 0;
                        });
                        result[grouped[groupId].index] = grouped[groupId];
                    }
                    else {
                        let groupItem = {};
                        node.groupBy.map(groupProperty => {
                            groupItem[groupProperty] = listItem[groupProperty] || '';
                        });
                        node.sumProperties.map(sumProperty => {
                            groupItem[sumProperty] = listItem[sumProperty] || 0;
                        });
                        groupItem.groupId = groupId;
                        groupItem.index = result.length;
                        grouped[groupId] = groupItem;
                        result.push(groupItem);
                    }
                });
                if (!!node.clearPayload) {
                    payload = {};
                }
                payload[node.outputProperty] = result;
            }
        }
        return payload;
    }
    getName() {
        return 'GroupAndSumTask';
    }
}
//# sourceMappingURL=group-and-sum-task.js.map