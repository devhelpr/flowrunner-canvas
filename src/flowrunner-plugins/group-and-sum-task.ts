import { FlowTask } from '@devhelpr/flowrunner';

/*


  - groupProperty (should be an array property in the payload)
  - outputProperty (can be the same as groupProperty)

  - groupBy : string[] 
  - sumProperties : string[]

*/

export class GroupAndSumTask extends FlowTask {
  public execute(node: any, services: any) {
    let payload = { ...node.payload };
    if (
      node.outputProperty &&
      node.groupProperty &&
      payload[node.groupProperty] &&
      node.groupBy &&
      node.sumProperties
    ) {
      let list: any[] = payload[node.groupProperty];

      if (list) {
        let result: any[] = [];
        let grouped: any = {};

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
          } else {
            let groupItem: any = {};
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

  public getName() {
    return 'GroupAndSumTask';
  }
}
