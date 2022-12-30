import { FlowTask } from '@devhelpr/flowrunner';
import { addDebugInfoForEvent } from '../debug-info/debug-info';
import { getPropertyByNamespacedName } from '../helpers/namespaced-properties';

export class OperationEventTask extends FlowTask {
  public override execute(node: any, services: any) {
    const flow = services.workerContext.flow;
    return new Promise((resolve, reject) => {
      const operator = node.operation || '';
      let rootPayload = { ...node.payload };
      if (true) {
        let result: any;
        if (operator === 'fillList') {
          result = new Array();
        } else {
          result = {};
        }

        let loop = 0;
        let copyPayload = { ...rootPayload };
        const callEventFlow = (element, index) => {
          return new Promise<any>((resolveCall, rejectCall) => {
            try {
              // should we use "item" or "element" to specify
              // the separate array values in the payload send to "onItem"
              // ... should it be onItem or onElement??
              let elementPayload: any = {};
              if (typeof element === 'object') {
                elementPayload = { ...element, root: copyPayload };
              } else {
                elementPayload = {
                  element,
                  root: copyPayload,
                };
              }

              elementPayload['_eventContext'] = `${copyPayload['_eventContext'] || ''}_${node.name}_${index}`;

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
          const count =
            parseInt(node.ExecuteCount) || parseInt(getPropertyByNamespacedName(node.ExecuteCount, rootPayload)) || 0;

          for (let loop = 0; loop < count; loop++) {
            //console.log("operation" , loop, count);
            const resultCall = await callEventFlow(
              operator === 'fillList'
                ? {
                    index: loop,
                  }
                : { ...result, index: loop },
              loop,
            );
            if (operator === 'fillList') {
              delete resultCall.payload.index;
              result.push(resultCall.payload);
            } else {
              result = { ...result, ...resultCall.payload };
              delete result.index;
            }

            addDebugInfoForEvent(
              node.name,
              rootPayload._eventContext || '',
              'onElement',
              loop,
              structuredClone(resultCall.payload),
            );
          }
        };

        try {
          forAllElements()
            .then(() => {
              rootPayload[node.outputProperty || 'result'] = result;
              resolve(rootPayload);
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
