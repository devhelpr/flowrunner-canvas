import { useEffect, useState, useCallback } from 'react';
import fetch from 'cross-fetch';

import { IFlowrunnerConnector } from './interfaces/IFlowrunnerConnector';
import { useFlowStore } from './state/flow-state';
import { useLayoutStore } from './state/layout-state';
import { useCanvasModeStateStore } from './state/canvas-mode-state';

import { getPosition } from './services/position-service';

export enum FlowState {
  idle = 0,
  loading,
  loaded,
  error,
}

export const useFlows = (flowrunnerConnector: IFlowrunnerConnector, flowId?: string | number) => {
  const [flowState, setFlowState] = useState(FlowState.idle);
  const [currentFlowId, setCurrentFlowId] = useState(flowId);
  const [flow, setFlow] = useState([] as any[]);
  const [flows, setFlows] = useState([] as any[] | undefined);
  const [flowType, setFlowType] = useState('');

  const flowStore = useFlowStore();
  const layout = useLayoutStore();
  const setCanvasFlowType = useCanvasModeStateStore(state => state.setFlowType);
  const canvasflowType = useCanvasModeStateStore(state => state.flowType);

  const getFlows = (getFlowId?) => {
    if (flowrunnerConnector.hasStorageProvider) {
      const flows = flowrunnerConnector.storageProvider?.getFlows();
      setFlows(flows);

      let loadFlowId = flowId === undefined && flows ? flows[0].id : flowId;
      if (getFlowId) {
        loadFlowId = getFlowId;
      }

      loadFlow(loadFlowId);
      return;
    }

    fetch('/get-flows')
      .then(res => {
        if (res.status >= 400) {
          setFlowState(FlowState.error);
          throw new Error('Bad response from server');
        }
        return res.json();
      })
      .then(flows => {
        if (flows.length > 0) {
          setFlows(flows);
          //const id =      flowId === undefined ? flows[0].id : currentFlowId;
          let loadFlowId = flowId === undefined && flows ? flows[0].id : currentFlowId;
          if (getFlowId) {
            loadFlowId = getFlowId;
          }
          loadFlow(loadFlowId);
          //loadFlow(id);
        }
      })
      .catch(err => {
        console.error(err);
      });
  };

  const loadFlow = (flowId?: string | number) => {
    setCurrentFlowId(flowId);
    setFlowState(FlowState.loading);
  };

  const reloadFlow = () => {
    setFlowState(FlowState.loading);
  };

  useEffect(() => {
    if (flowState == FlowState.loading) {
      if (flowrunnerConnector.hasStorageProvider) {
        const flowPackage: any = flowrunnerConnector.storageProvider?.getFlow(currentFlowId as string) as any;
        flowrunnerConnector.setFlowType(flowPackage.flowType || 'playground');
        setFlowType(flowPackage.flowType || 'playground');
        setCanvasFlowType(flowPackage.flowType || 'playground');
        flowStore.storeFlow(flowPackage.flow, currentFlowId as string);
        setFlow(flowPackage.flow);
        layout.storeLayout(JSON.stringify(flowPackage.layout));
        setFlowState(FlowState.loaded);
        return;
      }

      fetch('/flow?flow=' + currentFlowId)
        .then(res => {
          if (res.status >= 400) {
            setFlowState(FlowState.error);
            throw new Error('Bad response from server');
          }
          return res.json();
        })
        .then(flowPackage => {
          flowrunnerConnector.setFlowType(flowPackage.flowType || 'playground');
          setFlowType(flowPackage.flowType || 'playground');
          setCanvasFlowType(flowPackage.flowType || 'playground');
          flowStore.storeFlow(flowPackage.flow, currentFlowId as string);
          setFlow(flowPackage.flow);
          layout.storeLayout(JSON.stringify(flowPackage.layout));
          setFlowState(FlowState.loaded);
        })
        .catch(err => {
          console.error(err);
          setFlowState(FlowState.error);
        });
    }
  }, [flowState, flowrunnerConnector]);

  const onGetFlows = (id?: string | number) => {
    setCurrentFlowId(id);
    getFlows(id);
  };

  useEffect(() => {
    console.log('useeffect use-flows', flowStore.flow);
  }, [flowStore.flow]);

  const saveFlow = useCallback(
    (selectedFlow?) => {
      const flowAndUpdatedPositions = flowStore.flow.map(node => {
        let updatedNode = { ...node };
        if (node.x !== undefined && node.y !== undefined && node.shapeType !== 'Line') {
          const position = getPosition(node.name);
          updatedNode.x = position.x;
          updatedNode.y = position.y;
        } else if (node.xstart !== undefined && node.ystart !== undefined && node.shapeType === 'Line') {
          const position = getPosition(node.name);

          updatedNode.xstart = position.xstart;
          updatedNode.ystart = position.ystart;
          updatedNode.xend = position.xend;
          updatedNode.yend = position.yend;
        }
        return updatedNode;
      });
      if (flowrunnerConnector.hasStorageProvider) {
        console.log('flowAndUpdatedPositions', flowAndUpdatedPositions);
        flowrunnerConnector.storageProvider?.saveFlow(currentFlowId as string, flowAndUpdatedPositions);
        if (selectedFlow) {
          loadFlow(selectedFlow); //,true
        }
      } else {
        fetch('/save-flow?id=' + selectedFlow, {
          method: 'POST',
          body: JSON.stringify({
            flow: flowAndUpdatedPositions,
            layout: JSON.parse(layout.layout),
            flowType: canvasflowType,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then(res => {
            if (res.status >= 400) {
              throw new Error('Bad response from server');
            }

            return res.json();
          })
          .then(status => {
            if (selectedFlow) {
              loadFlow(selectedFlow); //,true
            }
          })
          .catch(err => {
            console.error(err);
          });
      }
    },
    [flowStore.flow, flowrunnerConnector],
  );

  return {
    flowState,
    flowId,
    flow,
    flowType,
    flows,
    getFlows,
    loadFlow,
    onGetFlows,
    saveFlow,
    reloadFlow,
  };
};
