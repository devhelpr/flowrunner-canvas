import { FlowTask, ObservableTask } from '@devhelpr/flowrunner';
import * as uuid from 'uuid';
const uuidV4 = uuid.v4;

export class FormTask extends ObservableTask {
  public execute(node: any, services: any) {
    //console.log('FormTask', node);
    try {
      let values: any = {};
      let isValid = true;
      (node.metaInfo || []).map((metaInfo, index) => {
        if (metaInfo.fieldName && node[metaInfo.fieldName]) {
          values[metaInfo.fieldName] = node[metaInfo.fieldName];
        }

        if (!!metaInfo.required && metaInfo.fieldName && values[metaInfo.fieldName] === undefined) {
          isValid = false;
        }
      });
      let payload = { ...node.payload, ...values };
      payload.debugId = uuidV4(); // use this to match between (line)graph and history sliders
      super.execute({ ...node, sendNodeName: true, payload: payload }, services);
      if (isValid) {
        return payload;
      }
      return false;
    } catch (err) {
      console.log('FormTask error', err);
    }
    return false;
  }

  public getName() {
    return 'FormTask';
  }
}
