import { FlowTask } from '@devhelpr/flowrunner';

/*

  - rules : array[IDeepReassignRule]
      source -> which data to read?
      target -> where to transform to?

    both should be able to have a format like
      property1.property2.[x].property3.[y] 

      start with no support for [x]
*/

export interface IDeepReassignRule {
  source : string;
  target : string;
}

export class DeepReassignTask extends FlowTask {
  public execute(node: any, services: any) {
    let payload = { ...node.payload };
    try {
      if (node.rules) {
        node.rules.map((rule : IDeepReassignRule) => {
          let sourceData = this.getSource(rule.source, payload);
          if (sourceData !== false) {
            this.setData(rule.target, sourceData , payload);
          }
        });
        payload = {...node.payload, ...payload};
      }
    } catch (err) {
      console.error("DeepReassignTask" , err);
    }
    return payload;
  }

  public getName() {
    return 'DeepReassignTask';
  }  

  public getSource = (source : string, payload: any) => {
    let splittedSource = source.split('.');
    let data = payload;
    const result = splittedSource.map((propertyKey : string) => {
      if (data[propertyKey]) {
        data = data[propertyKey];
        return true;
      }
      return false;
    }).filter((result) => !result);

    if (result && result.length > 0) {
      return false;
    }

    return data;
  }

  public setData = (target : string, data : any, payload : any) => {
    let splittedTarget = target.split('.');
    const result = splittedTarget.map((propertyKey : string, index: number) => {
      if (payload[propertyKey]) {
        if (index == splittedTarget.length  - 1) {
          payload[propertyKey] = data;
        } else {
          payload = payload[propertyKey];
        }
        return true;
      }
      return false;
    }).filter((result) => !result);

    if (result && result.length > 0) {
      return false;
    }

    return true;
  }
  
}
