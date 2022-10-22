import { FlowTask } from '@devhelpr/flowrunner';

export class FilterEventTask extends FlowTask {
  public override execute(node: any, services: any) {
    const flow = services.workerContext.flow;
    return new Promise((resolve, reject) => {
      let payload = { ...node.payload };
      if (node.listProperty && payload[node.listProperty]) {
        if (!Array.isArray(payload[node.listProperty])) {
          reject();
          return;
        }

        const result: any[] = new Array();
        const callEventFlow = (element) => {
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
          for (const element of iterable) {
            const resultCall = await callEventFlow(element);
            if (resultCall.payload.result == 1) {
              result.push(element);
            }
          }
        };

        try {
          forAllElements(payload[node.listProperty])
            .then(() => {
              payload[node.outputProperty || 'result'] = result;
              resolve(payload);
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
