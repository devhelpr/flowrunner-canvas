import { createExpressionTree, executeExpressionTree } from '@devhelpr/expressionrunner';
import { ObservableTask } from '@devhelpr/flowrunner';
import * as uuid from 'uuid';
const uuidV4 = uuid.v4;

export class FormTask extends ObservableTask {
  public override execute(node: any, services: any) {
    if (services.isInAutoFormStepMode) {
      if (!services.flowEventRunner.getPropertyFromNode(node.name, 'waitForUserSubmit')) {
        return false;
      }
    }

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
          if (metaInfo.fieldType === 'triggerbutton') {
            currentValue = services.flowEventRunner.getPropertyFromNode(node.name, metaInfo.fieldName);
            if (currentValue === 'trigger' || !!metaInfo.autoTrigger) {
              currentValue = '';
              values[metaInfo.fieldName] = '';

              services.flowEventRunner.setPropertyOnNode(node.name, metaInfo.fieldName, '');
            } else {
              currentValue = undefined;
              values[metaInfo.fieldName] = undefined;
              isValid = false;
            }
          } else {
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
                  datasource.map((item) => {
                    if (typeof item === 'string' || typeof item === 'number') {
                      if (item.toString() === currentValue) {
                        isFound = true;
                      }
                    } else if (item.value !== undefined && item.value === currentValue) {
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
        }

        if (currentValue === undefined && metaInfo.fieldName && node[metaInfo.fieldName] !== undefined) {
          values[metaInfo.fieldName] = node[metaInfo.fieldName];
        }

        let isVisible = true;
        if (metaInfo.visibilityCondition) {
          const expression = createExpressionTree(metaInfo.visibilityCondition);
          let data = { ...node, ...node.payload, ...values };
          const result = executeExpressionTree(expression, data);
          isVisible = !!result;
        }

        if (isVisible && !!metaInfo.required && metaInfo.fieldName && values[metaInfo.fieldName] === undefined) {
          isValid = false;
        }
      });
      let payload = { ...node.payload, ...values };
      payload.debugId = uuidV4(); // use this to match between (line)graph and history sliders
      super.execute({ ...node, sendNodeName: true, payload: payload }, services);

      let hasValues = Object.keys(values).length > 0;
      if (isValid && hasValues) {
        if (node.outputProperty && node.outputExpression) {
          const expression = createExpressionTree(node.outputExpression);
          let data = { ...values };
          payload[node.outputProperty] = executeExpressionTree(expression, data);
        }

        if (services.isInAutoFormStepMode) {
          services.flowEventRunner.setPropertyOnNode(node.name, 'waitForUserSubmit', false);
        }

        console.log('form-task', node.name, isValid, hasValues, values, metaInfoDefinition, payload);
        return payload;
      }
      console.log('form-task', node.name, isValid, hasValues, values, metaInfoDefinition);
      return false;
    } catch (err) {
      console.log('FormTask error', err);
    }
    return false;
  }

  public override getName() {
    return 'FormTask';
  }
}
