import { FlowTask } from '@devhelpr/flowrunner';

export class SelectValueFromListTask extends FlowTask {
  public execute(node: any, services: any) {
    if (node.inputProperty && node.outputProperty && node.selectvalue && node.list && node.list.length > 0) {
      let payload = { ...node.payload };
      if (payload[node.inputProperty]) {
        const inputValue = parseFloat(payload[node.inputProperty]);

        const results = node.list.filter(listItem => {
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
            payload[node.outputProperty] = results[0].outputValue;
          } else {
            payload[node.outputProperty] = results[results.length - 1].outputValue;
          }
          return payload;
        }
        return false;
      }
    }
    return false;
  }

  public getName() {
    return 'SelectValueFromListTask';
  }
}
