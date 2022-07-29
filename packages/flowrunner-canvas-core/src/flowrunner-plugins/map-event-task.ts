import { FlowTask } from '@devhelpr/flowrunner';

export class MapEventTask extends FlowTask {
  public override execute(node: any, services: any) {
    const flow = services.workerContext.flow;
    return new Promise((resolve, reject) => {
      let payload = { ...node.payload };
      if (node.listProperty && payload[node.listProperty]) {
        if (!Array.isArray(payload[node.listProperty])) {
          reject();
          return;
        }

        const length = payload[node.listProperty].length;
        const result: any[] = new Array(length);
        let loop = 0;
        const callEventFlow = (element) => {
          return new Promise<any>((resolveCall, rejectCall) => {
            try {
              // should we use "item" or "element" to specify
              // the separate array values in the payload send to "onItem"
              // ... should it be onItem or onElement??
              let elementPayload : any = {};
              if (typeof element === "object") {
                elementPayload = {...element};
              } else {
                elementPayload = {
                  element
                }
              };
              flow
                .triggerEventOnNode(node.name, 'onElement', elementPayload)
                .then((payload) => {
                  if (payload.nodeExecutionId) {
                    delete payload.nodeExecutionId;
                  }
                  let payloadKeys = Object.keys(payload);
                  if (payloadKeys.indexOf("_forwardFollowFlow") >= 0) {
                    delete payload._forwardFollowFlow;
                  }
                  payloadKeys = Object.keys(payload);
                  resolveCall({
                    payload: (payloadKeys.length === 1 && payload.element) || payload,
                  });
                })
                .catch(() => {
                  rejectCall();
                });
            } catch (err) {
              console.log("Error in MapEventTask onElement", err);
              rejectCall();
            }
          });
        };

        const forAllElements = async (iterable) => {
          let index = 0;
          for (const element of iterable) {
            const resultCall = await callEventFlow(element);
            result[index] = resultCall.payload;
            index++;
          }
        };

        try {
          forAllElements(payload[node.listProperty]).then(() => {
            payload[node.outputProperty || 'result'] = result;
            resolve(payload);
          }).catch((err) => {
            console.log('Error in MapEventTask onElement', err);
            reject();
          });  
        } catch (err) {
          console.log('Error in MapEventTask onElement', err);
          reject();
        }                
      }
    });
  }

  public override getName() {
    return 'MapEventTask';
  }
}
