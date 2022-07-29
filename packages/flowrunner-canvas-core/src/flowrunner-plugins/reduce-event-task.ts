import { FlowTask } from '@devhelpr/flowrunner';

export class ReduceEventTask extends FlowTask {
  public override execute(node: any, services: any) {
    /*
      .. send accumalator, element/item .. return result
      .. accumulator starts with value of node.startValue
      // accumulator is set to result are executing for each element/item
    */
    const flow = services.workerContext.flow;
    return new Promise((resolve, reject) => {
      let payload = { ...node.payload };
      if (node.listProperty && payload[node.listProperty]) {
        if (!Array.isArray(payload[node.listProperty])) {
          reject();
          return;
        }

        let accumulator = parseFloat(node.startValue) || node.startValue;

        //const result: any[] = new Array();
        const callEventFlow = (element) => {
          return new Promise<any>((resolveCall, rejectCall) => {
            try {
              let elementPayload: any = {};
              if (typeof element === 'object') {
                elementPayload = { ...element };
              } else {
                elementPayload = {
                  element
                };
              }

              elementPayload.accumulator = accumulator;

              flow
                .triggerEventOnNode(node.name, 'onElement', elementPayload)
                .then((payload) => {
                  resolveCall({
                    payload
                  });
                })
                .catch(() => {
                  rejectCall();
                });
            } catch (err) {
              console.log('Error in ReduceEventTask onElement', err);
              rejectCall();
            }
          });
        };

        const forAllElements = async (iterable) => {
          for (const element of iterable) {
            const result = await callEventFlow(element);
            accumulator = result.payload.result;
          }
        };

        try {
          forAllElements(payload[node.listProperty]).then(() => {
            payload[node.outputProperty || 'result'] = accumulator;
              resolve(payload);
          }).catch((err) => {
            console.log('Error in ReduceEventTask onElement', err);
            reject();
          }); 
        } catch (err) {
          console.log('Error in ReduceEventTask onElement', err);
          reject();
        }
      }    
    });
  }

  public override getName() {
    return 'ReduceEventTask';
  }
}
