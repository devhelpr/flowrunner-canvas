import { useEffect, useState, useCallback, useRef } from 'react';
import { IFlowrunnerConnector } from '../interfaces/IFlowrunnerConnector';

import * as uuid from 'uuid';
const uuidV4 = uuid.v4;

export const useReceivedPayload = (flowrunnerConnector?: IFlowrunnerConnector, node?, flow?) => {
  const [receivedPayload, setReceivedPayload] = useState<any>({});
  const observableId = useRef(uuidV4());
  const unmounted = useRef(false);

  useEffect(() => {
    unmounted.current = false;
    console.log('DataTableNodeHtmlPlugin mount');
    if (flowrunnerConnector && node) {
      flowrunnerConnector.registerFlowNodeObserver(node.name, observableId.current, receivePayloadFromNode);
    }
    return () => {
      console.log('DataTableNodeHtmlPlugin unmount');
      if (flowrunnerConnector && node) {
        flowrunnerConnector.unregisterFlowNodeObserver(node.name, observableId.current);
      }
      unmounted.current = true;
    };
  }, []);

  useEffect(() => {
    unmounted.current = false;
    console.log('DataTableNodeHtmlPlugin mount nf');
    if (flowrunnerConnector && node) {
      flowrunnerConnector.registerFlowNodeObserver(node.name, observableId.current, receivePayloadFromNode);
    }
    return () => {
      unmounted.current = true;
      console.log('DataTableNodeHtmlPlugin unmount nf');
      if (flowrunnerConnector && node) {
        flowrunnerConnector.unregisterFlowNodeObserver(node.name, observableId.current);
      }
    };
  }, [node, flow]);

  const receivePayloadFromNode = useCallback(
    (payload: any) => {
      console.log('data-table-node payload', payload);
      if (unmounted.current) {
        return;
      }
      if (!!payload.isDebugCommand) {
        if (payload.debugCommand === 'resetPayloads') {
          setReceivedPayload({});
        }
        return;
      }

      setReceivedPayload({ ...payload });
    },
    [node, flow],
  );

  return { payload: receivedPayload };
};
