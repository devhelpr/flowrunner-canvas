import { FlowTask } from '@devhelpr/flowrunner';
import { addDebugInfoForEvent } from '../debug-info/debug-info';
import { getPropertyByNamespacedName } from '../helpers/namespaced-properties';

export class MapEventTask extends FlowTask {
  public override execute(node: any, services: any) {
    const flow = services.workerContext.flow;
    return new Promise((resolve, reject) => {
      let rootPayload = { ...node.payload };
      const listPropertyValue = getPropertyByNamespacedName(node.listProperty, rootPayload);
      if (node.listProperty && listPropertyValue) {
        if (!Array.isArray(listPropertyValue)) {
          reject();
          return;
        }

        const length = listPropertyValue.length;
        const result: any[] = new Array(length);
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
                  index,
                  root: copyPayload,
                };
              }

              elementPayload['_eventContext'] = `${copyPayload['_eventContext'] || ''}_${node.name}_${index}`;

              //console.log('mapevent BEFORE EACH', node.name, index, elementPayload);
              flow
                .triggerEventOnNode(node.name, 'onElement', elementPayload)
                .then((payload) => {
                  const mapReturnPayload = { ...payload };
                  if (mapReturnPayload.nodeExecutionId) {
                    delete mapReturnPayload.nodeExecutionId;
                  }
                  let payloadKeys = Object.keys(mapReturnPayload);
                  if (payloadKeys.indexOf('_forwardFollowFlow') >= 0) {
                    delete mapReturnPayload._forwardFollowFlow;
                  }
                  payloadKeys = Object.keys(mapReturnPayload);
                  mapReturnPayload['index'] = index;
                  delete mapReturnPayload.root;
                  //console.log('mapevent AFTER EACH', node.name, index, mapReturnPayload);
                  resolveCall({
                    payload: (payloadKeys.length === 1 && mapReturnPayload.element) || mapReturnPayload,
                  });
                })
                .catch(() => {
                  rejectCall();
                });
            } catch (err) {
              console.log('Error in MapEventTask onElement', err);
              rejectCall();
            }
          });
        };

        const forAllElements = async (iterable) => {
          let index = 0;
          for (const element of iterable) {
            const resultCall = await callEventFlow(element, index);
            addDebugInfoForEvent(
              node.name,
              rootPayload._eventContext || '',
              'onElement',
              index,
              structuredClone(resultCall.payload),
            );
            result[index] = { ...resultCall.payload };
            index++;
          }
        };

        try {
          forAllElements(listPropertyValue)
            .then(() => {
              rootPayload[node.outputProperty || 'result'] = result;

              console.log('MAPEVENT READY', node.name, result);
              resolve(rootPayload);
            })
            .catch((err) => {
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
