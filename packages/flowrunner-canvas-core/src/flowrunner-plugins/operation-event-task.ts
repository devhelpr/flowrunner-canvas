import { FlowTask } from '@devhelpr/flowrunner';

export class OperationEventTask extends FlowTask {
  public override execute(node: any, services: any) {
    const flow = services.workerContext.flow;
    return new Promise((resolve, reject) => {
      const operator = node.operation || '';
      let payload = { ...node.payload };
      if (true) {
        let result: any;
        if (operator === 'fillList') {
          result = new Array();
        } else {
          result = {};
        }

        let loop = 0;
        const callEventFlow = (element) => {
          return new Promise<any>((resolveCall, rejectCall) => {
            try {
              // should we use "item" or "element" to specify
              // the separate array values in the payload send to "onItem"
              // ... should it be onItem or onElement??
              let elementPayload: any = {};
              if (typeof element === 'object') {
                elementPayload = { ...element };
              } else {
                elementPayload = {
                  element,
                };
              }
              flow
                .triggerEventOnNode(node.name, 'onElement', elementPayload)
                .then((payload) => {
                  if (payload.nodeExecutionId) {
                    delete payload.nodeExecutionId;
                  }
                  let payloadKeys = Object.keys(payload);
                  if (payloadKeys.indexOf('_forwardFollowFlow') >= 0) {
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
              console.log('Error in OperationEventTask onElement', err);
              rejectCall();
            }
          });
        };

        const forAllElements = async () => {
          const count = parseInt(node.ExecuteCount) || 0;

          for (let loop = 0; loop < count; loop++) {
            //console.log("operation" , loop, count);
            const resultCall = await callEventFlow(
              operator === 'fillList'
                ? {
                    index: loop,
                  }
                : { ...result, index: loop },
            );
            if (operator === 'fillList') {
              delete resultCall.payload.index;
              result.push(resultCall.payload);
            } else {
              result = { ...result, ...resultCall.payload };
              delete result.index;
            }
          }
        };

        try {
          forAllElements()
            .then(() => {
              payload[node.outputProperty || 'result'] = result;
              resolve(payload);
            })
            .catch((err) => {
              console.log('Error in OperationEventTask onElement', err);
              reject();
            });
        } catch (err) {
          console.log('Error in OperationEventTask onElement', err);
          reject();
        }
      }
    });
  }

  public override getName() {
    return 'OperationEventTask';
  }
}
