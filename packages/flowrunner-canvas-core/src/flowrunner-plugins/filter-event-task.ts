import { FlowTask } from '@devhelpr/flowrunner';
import { addDebugInfoForEvent } from '../debug-info/debug-info';

export class FilterEventTask extends FlowTask {
  public override execute(node: any, services: any) {
    const flow = services.workerContext.flow;
    return new Promise((resolve, reject) => {
      let copyPayload = { ...node.payload };
      if (node.listProperty && copyPayload[node.listProperty]) {
        if (!Array.isArray(copyPayload[node.listProperty])) {
          reject();
          return;
        }

        const result: any[] = new Array();
        const callEventFlow = (element, index) => {
          return new Promise<any>((resolveCall, rejectCall) => {
            try {
              let elementPayload: any = {};
              if (typeof element === 'object') {
                elementPayload = { ...element };
              } else {
                elementPayload = {
                  element,
                };
              }

              elementPayload['_eventContext'] = `${copyPayload['_eventContext'] || ''}_${node.name}_${index}`;

              flow
                .triggerEventOnNode(node.name, 'onElement', elementPayload)
                .then((payload) => {
                  resolveCall({
                    payload,
                  });
                })
                .catch(() => {
                  console.log('callEventFlow reject');
                  rejectCall();
                });
            } catch (err) {
              console.log('Error in FilterEventTask onElement', err);
              rejectCall();
            }
          });
        };

        const forAllElements = async (iterable) => {
          let index = 0;
          for (const element of iterable) {
            const resultCall = await callEventFlow(element, index);
            if (resultCall.payload.result == 1) {
              result.push(element);
            }

            addDebugInfoForEvent(
              node.name,
              copyPayload._eventContext || '',
              'onElement',
              index,
              structuredClone(resultCall.payload),
            );

            index++;
          }
        };

        try {
          forAllElements(copyPayload[node.listProperty])
            .then(() => {
              copyPayload[node.outputProperty || 'result'] = result;
              resolve(copyPayload);
            })
            .catch((err) => {
              console.log('Error in FilterEventTask onElement', err);
              reject();
            });
        } catch (err) {
          console.log('Error in FilterEventTask onElement', err);
          reject();
        }
      }
    });
  }

  public override getName() {
    return 'FilterEventTask';
  }
}
