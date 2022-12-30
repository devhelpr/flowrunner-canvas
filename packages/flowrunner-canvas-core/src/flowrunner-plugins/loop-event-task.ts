import { FlowTask } from '@devhelpr/flowrunner';

export class LoopEventTask extends FlowTask {
  public override execute(node: any, services: any) {
    const flow = services.workerContext.flow;
    return new Promise((resolve, reject) => {
      let rootPayload = { ...node.payload };
      let clojureScope: any = {};

      let copyPayload = { ...rootPayload };
      const callEventFlow = () => {
        return new Promise((resolveCall, rejectCall) => {
          window.requestAnimationFrame(() => {
            try {
              let elementPayload: any = {};
              elementPayload = {
                root: copyPayload,
                ...clojureScope,
              };

              //elementPayload['_eventContext'] = `${copyPayload['_eventContext'] || ''}_${node.name}`;

              //console.log('foreachevent BEFORE EACH', node.name, index, elementPayload);
              flow
                .triggerEventOnNode(node.name, 'onElement', elementPayload)
                .then((payload) => {
                  if (Array.isArray(node.scopeVariables)) {
                    node.scopeVariables.forEach((scopeVariable) => {
                      if (payload[scopeVariable.variableName]) {
                        clojureScope[scopeVariable.variableName] = payload[scopeVariable.variableName];
                      }
                    });
                  }
                  resolveCall(payload);
                })
                .catch((err) => {
                  console.log('Error catch promise in LoopEventTask onElement', err);
                  resolveCall(false);
                });
            } catch (err) {
              console.log('Error in LoopEventTask onElement', err);
              rejectCall(false);
            }
          });
        });
      };

      const loop = async () => {
        let quitLoop = false;
        while (!quitLoop) {
          const result = await callEventFlow();
          if (!result || (result as any).quitLoop) {
            quitLoop = true;
          }
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
        loop()
          .then(() => {
            rootPayload = { ...rootPayload, ...clojureScope };
            console.log('LoopEVENT READY', node.name, rootPayload);
            resolve(rootPayload);
          })
          .catch((err) => {
            console.log('Error in LoopEventTask onElement', err);
            reject();
          });
      } catch (err) {
        console.log('Error in LoopEventTask onElement', err);
        reject();
      }
    });
  }

  public override getName() {
    return 'LoopEventTask';
  }
}
