import { FlowTask } from '@devhelpr/flowrunner';
import { addDebugInfoForEvent } from '../debug-info/debug-info';
import { getPropertyByNamespacedName } from '../helpers/namespaced-properties';

export class ForEachEventTask extends FlowTask {
  public override execute(node: any, services: any) {
    const flow = services.workerContext.flow;
    return new Promise((resolve, reject) => {
      let rootPayload = { ...node.payload };
      let clojureScope: any = {};
      const listPropertyValue = getPropertyByNamespacedName(node.listProperty, rootPayload);
      if (node.listProperty && listPropertyValue) {
        if (!Array.isArray(listPropertyValue)) {
          reject();
          return;
        }

        let copyPayload = { ...rootPayload };
        const callEventFlow = (element, index) => {
          return new Promise((resolveCall, rejectCall) => {
            try {
              let elementPayload: any = {};
              if (typeof element === 'object') {
                elementPayload = { ...element, root: copyPayload, ...clojureScope };
              } else {
                elementPayload = {
                  element,
                  index,
                  root: copyPayload,
                  ...clojureScope,
                };
              }

              elementPayload['_eventContext'] = `${copyPayload['_eventContext'] || ''}_${node.name}_${index}`;

              //console.log('foreachevent BEFORE EACH', node.name, index, elementPayload);
              flow
                .triggerEventOnNode(node.name, 'onElement', elementPayload)
                .then((payload) => {
                  node.scopeVariables.forEach((scopeVariable) => {
                    if (payload[scopeVariable.variableName]) {
                      clojureScope[scopeVariable.variableName] = payload[scopeVariable.variableName];
                    }
                  });
                  resolveCall(true);
                })
                .catch(() => {
                  resolveCall(true);
                });
            } catch (err) {
              console.log('Error in ForEachEventTask onElement', err);
              rejectCall();
            }
          });
        };

        const forAllElements = async (iterable) => {
          let index = 0;
          for (const element of iterable) {
            await callEventFlow(element, index);
            addDebugInfoForEvent(
              node.name,
              rootPayload._eventContext || '',
              'onElement',
              index,
              structuredClone(clojureScope),
            );
            index++;
          }
        };

        try {
          if (Array.isArray(node.scopeVariables)) {
            node.scopeVariables.forEach((scopeVariable) => {
              if (scopeVariable.initialValue == scopeVariable.variableName) {
                clojureScope[scopeVariable.variableName] = rootPayload[scopeVariable.variableName];
              } else if (scopeVariable.variableType === 'number') {
                clojureScope[scopeVariable.variableName] = parseFloat(scopeVariable.initialValue) || 0;
              } else {
                if (scopeVariable.initialValue == '[]') {
                  clojureScope[scopeVariable.variableName] = [];
                } else {
                  clojureScope[scopeVariable.variableName] = scopeVariable.initialValue || '';
                }
              }
            });
          }
          forAllElements(listPropertyValue)
            .then(() => {
              rootPayload = { ...rootPayload, ...clojureScope };
              console.log('FOREACHEVENT READY', node.name, rootPayload);
              resolve(rootPayload);
            })
            .catch((err) => {
              console.log('Error in ForEachEventTask onElement', err);
              reject();
            });
        } catch (err) {
          console.log('Error in ForEachEventTask onElement', err);
          reject();
        }
      }
    });
  }

  public override getName() {
    return 'ForEachEventTask';
  }
}
