import { FlowTask, ObservableTask } from '@devhelpr/flowrunner';
import * as uuid from 'uuid';
const uuidV4 = uuid.v4;

export class FormTask extends ObservableTask {
  public execute(node: any, services: any) {
    //console.log('FormTask', node);

    if (!!node.formDefinitionAsPayload) {
      const payload = { ...node.payload };
      payload['metaInfo'] = node.metaInfo || [];
      return payload;
    }

    try {
      let values: any = {};
      let isValid = true;
      let metaInfoDefinition = node.metaInfo;
      if (!!node.renderFormViaMetaInfoInPayload) {
        metaInfoDefinition = node.payload['metaInfo'];
      }

      (metaInfoDefinition || []).map((metaInfo, index) => {
        let currentValue;
        if (metaInfo.fieldName) {
          currentValue = services.flowEventRunner.getPropertyFromNode(node.name, metaInfo.fieldName);
          if (currentValue !== undefined) {
            // TODO : (naiev approach)
            // (.. check if metaInfo.fieldType == select/radiobutton)
            // .. check if currentValue exists in datasource
            // .. if not.. then use defaultValue or ""

            if (metaInfo.datasource && node.payload[metaInfo.datasource]) {
              const datasource = node.payload[metaInfo.datasource];
              if (datasource) {
                let isFound = false;
                datasource.map(item => {
                  if (item.value !== undefined && item.value === currentValue) {
                    isFound = true;
                  }
                });

                if (!isFound) {
                  currentValue = '';
                }
              }
            }

            values[metaInfo.fieldName] = currentValue;
          } else {
            if (metaInfo.defaultValue) {
              values[metaInfo.fieldName] = metaInfo.defaultValue;
              currentValue = metaInfo.defaultValue;
            }
          }
        }

        if (currentValue === undefined && metaInfo.fieldName && node[metaInfo.fieldName] !== undefined) {
          values[metaInfo.fieldName] = node[metaInfo.fieldName];
        }

        if (!!metaInfo.required && metaInfo.fieldName && values[metaInfo.fieldName] === undefined) {
          isValid = false;
        }
      });
      console.log('form task', values);
      let payload = { ...node.payload, ...values };
      payload.debugId = uuidV4(); // use this to match between (line)graph and history sliders
      super.execute({ ...node, sendNodeName: true, payload: payload }, services);

      let hasValues = Object.keys(values).length > 0;
      if (isValid && hasValues) {
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
