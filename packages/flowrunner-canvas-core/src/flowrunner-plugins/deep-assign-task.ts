import { FlowTask } from '@devhelpr/flowrunner';
/*

  - rules : array[IDeepReassignRule]
      source -> which data to read?
      target -> where to transform to?

    both should be able to have a format like
      property1.property2.[x].property3.[y] 
      
*/

export interface IDeepReassignRuleMapping {
  sourceProperty: string;
  targetProperty: string;
  defaultValue: any;
}

export interface IDeepReassignRule {
  source: string;
  target: string;
  mappings?: IDeepReassignRuleMapping[];
}

export class DeepAssignTask extends FlowTask {
  public execute(node: any, services: any) {
    let payload = { ...node.payload };
    try {
      if (node.rules) {
        node.rules.map((rule: IDeepReassignRule) => {
          let sourceData = this.getSource(rule.source, payload, rule.mappings);
          if (sourceData !== false) {
            this.setData(rule.target, sourceData, payload);
          }
        });
        payload = { ...node.payload, ...payload };
      }
    } catch (err) {
      console.error('DeepAssignTask', err);
    }
    return payload;
  }

  public getName() {
    return 'DeepAssignTask';
  }

  private getSource = (source: string, payload: any, mappings?: IDeepReassignRuleMapping[]) => {
    let splittedSource = source.split('.');
    let data = payload;
    let error = false;
    const result = splittedSource
      .map((propertyKey: string) => {
        if (!error) {
          const arrayIndex = this.getArrayIndexFromPropertyPathPart(propertyKey);
          if (arrayIndex !== false) {
            if (Array.isArray(data) && data.length > 0 && arrayIndex < data.length) {
              data = data[arrayIndex];
              return true;
            }
            error = true;
            return false;
          } else if (data[propertyKey] !== undefined) {
            data = data[propertyKey];
            return true;
          }
        }
        error = true;
        return false;
      })
      .filter(result => !result);

    if (error || (result && result.length > 0)) {
      return false;
    }

    if (mappings) {
      if (Array.isArray(data)) {
        let newData: any[] = [];
        data.map(dataItem => {
          let newItem = {};
          mappings.map((fieldMap: IDeepReassignRuleMapping) => {
            if (dataItem[fieldMap.sourceProperty]) {
              if (fieldMap.targetProperty !== undefined) {
                newItem[fieldMap.targetProperty] = dataItem[fieldMap.sourceProperty];
              } else {
                newItem = dataItem[fieldMap.sourceProperty];
              }
            } else {
              if (fieldMap.targetProperty !== undefined) {
                newItem[fieldMap.targetProperty] = fieldMap.defaultValue || '';
              } else {
                newItem = fieldMap.defaultValue || '';
              }
            }
          });
          newData.push(newItem);
        });
        data = newData;
      } else {
        let newData = {};
        mappings.map((fieldMap: IDeepReassignRuleMapping) => {
          if (data[fieldMap.sourceProperty] !== undefined) {
            newData[fieldMap.targetProperty] = data[fieldMap.sourceProperty];
          } else {
            newData[fieldMap.targetProperty] = fieldMap.defaultValue || '';
          }
        });
        data = newData;
      }
    }
    return data;
  };

  private setData = (target: string, data: any, payload: any) => {
    let splittedTarget = target.split('.');
    let error = false;
    const result = splittedTarget
      .map((propertyKey: string, index: number) => {
        if (!error) {
          const arrayIndex = this.getArrayIndexFromPropertyPathPart(propertyKey);
          if (arrayIndex !== false) {
            if (Array.isArray(payload) && payload.length > 0 && arrayIndex < payload.length) {
              if (index == splittedTarget.length - 1) {
                payload[arrayIndex] = data;
              } else {
                payload = payload[arrayIndex];
              }
              return true;
            }
            error = true;
            return false;
          } else if (payload[propertyKey] !== undefined) {
            if (index == splittedTarget.length - 1) {
              payload[propertyKey] = data;
            } else {
              payload = payload[propertyKey];
            }
            return true;
          } else if (splittedTarget.length == 1) {
            payload[propertyKey] = data;
            return true;
          }
        }
        error = true;
        return false;
      })
      .filter(result => !result);

    if (error || (result && result.length > 0)) {
      return false;
    }

    return true;
  };

  private getArrayIndexFromPropertyPathPart = (propertyPathPart: string) => {
    const matches = propertyPathPart.match(/^\[(\d+)\]$/g);
    if (matches && matches.length > 0) {
      let result = parseInt(matches[0].replace('[', '').replace(']', ''));
      if (!isNaN(result)) {
        return result;
      }
    }
    return false;
  };
}
