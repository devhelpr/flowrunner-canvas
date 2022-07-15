import { FlowTask } from '@devhelpr/flowrunner';
import { ObservableTask } from '@devhelpr/flowrunner';
import * as uuid from 'uuid';
const uuidV4 = uuid.v4;

export class SelectValueFromListTask extends ObservableTask {
  public override execute(node: any, services: any) {
    if (node.inputProperty && node.outputProperty && node.selectvalue && node.list && node.list.length > 0) {
      let payload = { ...node.payload };
      if (payload[node.inputProperty]) {
        const inputValue = parseFloat(payload[node.inputProperty]);
        const helperList = node.list.map((listItem, index) => {
          return { ...listItem, _index: index };
        });
        const results = helperList.filter(listItem => {
          if (listItem.selectionValue && listItem.outputValue && listItem.comparison) {
            const compareValue = parseFloat(listItem.selectionValue);
            if (listItem.comparison == 'smaller') {
              return inputValue < compareValue;
            } else if (listItem.comparison == 'smalleroreq') {
              return inputValue <= compareValue;
            } else if (listItem.comparison == 'eq') {
              return inputValue == compareValue;
            } else if (listItem.comparison == 'greater') {
              return inputValue > compareValue;
            } else if (listItem.comparison == 'greateroreq') {
              return inputValue >= compareValue;
            }
          }

          return false;
        });

        if (results.length > 0) {
          if (node.selectvalue == 'firstwins') {
            payload['_' + node.name + '-node'] = results[0]._index;
            payload[node.outputProperty] = results[0].outputValue;
          } else {
            payload['_' + node.name + '-node'] = results[results.length - 1]._index;
            payload[node.outputProperty] = results[results.length - 1].outputValue;
          }

          payload.debugId = uuidV4(); // use this to match between (line)graph and history sliders
          super.execute({ ...node, sendNodeName: true, payload: payload }, services);

          return payload;
        }
        payload.debugId = uuidV4(); // use this to match between (line)graph and history sliders
        super.execute({ ...node, sendNodeName: true, payload: payload }, services);
        return false;
      }
    }

    let payload = { ...node.payload };
    payload.debugId = uuidV4(); // use this to match between (line)graph and history sliders
    super.execute({ ...node, sendNodeName: true, payload: payload }, services);

    return false;
  }

  public override getName() {
    return 'SelectValueFromListTask';
  }
}
