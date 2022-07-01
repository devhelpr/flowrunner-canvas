import { useEffect, useState } from 'react';
import fetch from 'cross-fetch';

import { IFlowrunnerConnector } from './interfaces/IFlowrunnerConnector';
import { IFlowState } from './state/flow-state';
import { useLayoutStore } from './state/layout-state';
import { useCanvasModeStateStore } from './state/canvas-mode-state';

import { usePositionContext } from './components/contexts/position-context';

export enum FlowState {
  idle = 0,
  loading,
  loaded,
  error,
}

export const useFlows = (
  flowrunnerConnector: IFlowrunnerConnector,
  useFlowStore: () => IFlowState,
  flowId?: string | number,
  onFlowHasChanged?: (flow: any) => void,
) => {
  const positionContext = usePositionContext();
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
      if (flowrunnerConnector.storageProvider?.isAsync) {
        (flowrunnerConnector.storageProvider?.getFlows() as Promise<any[]>)
          .then((flows: any[]) => {
            setFlows(flows);

            let loadFlowId = flowId === undefined && flows ? flows[0].id : flowId;
            if (getFlowId) {
              loadFlowId = getFlowId;
            }

            loadFlow(loadFlowId);
          })
          .catch(error => {
            console.log('ERROR in getflows', error);
          });
      } else {
        const flows = flowrunnerConnector.storageProvider?.getFlows() as any[];
        setFlows(flows);

        let loadFlowId = flowId === undefined && flows ? flows[0].id : flowId;
        if (getFlowId) {
          loadFlowId = getFlowId;
        }

        loadFlow(loadFlowId);
      }
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

  const loadFlowFromMemory = (inputFlow: any[], flowId?: string | number) => {
    setFlowState(FlowState.loading);
    setTimeout(() => {
      setCurrentFlowId(flowId);
      setFlowType('playground');
      flowStore.storeFlow(inputFlow, currentFlowId as string);
      setFlow(inputFlow);
      setFlowState(FlowState.loaded);
    }, 10);
  };

  useEffect(() => {
    if (!currentFlowId) {
      return;
    }
    if (flowState == FlowState.loading) {
      if (flowrunnerConnector.hasStorageProvider) {
        if (flowrunnerConnector.storageProvider?.isAsync) {
          (flowrunnerConnector.storageProvider?.getFlow(currentFlowId as string) as Promise<any>).then(flowPackage => {
            console.log('LOAD FLOW', currentFlowId, flowPackage);
            positionContext.clearPositions();
            flowrunnerConnector.setFlowType(flowPackage.flowType || 'playground');
            setFlowType(flowPackage.flowType || 'playground');
            setCanvasFlowType(flowPackage.flowType || 'playground');
            flowStore.storeFlow(flowPackage.flow, currentFlowId as string);
            setFlow(flowPackage.flow);
            layout.storeLayout(JSON.stringify(flowPackage.layout));
            setFlowState(FlowState.loaded);
          });
        } else {
          positionContext.clearPositions();
          const flowPackage: any = flowrunnerConnector.storageProvider?.getFlow(currentFlowId as string) as any;
          flowrunnerConnector.setFlowType(flowPackage.flowType || 'playground');
          setFlowType(flowPackage.flowType || 'playground');
          setCanvasFlowType(flowPackage.flowType || 'playground');
          flowStore.storeFlow(flowPackage.flow, currentFlowId as string);
          setFlow(flowPackage.flow);
          layout.storeLayout(JSON.stringify(flowPackage.layout));
          setFlowState(FlowState.loaded);
        }
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
          console.log('LOAD FLOW via fetch', currentFlowId, flowPackage);
          positionContext.clearPositions();
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

  const saveFlow = (selectedFlow?, stateFlow?: any[]) => {
    console.log('SAVE FLOW', stateFlow, flowStore.flow);
    const flowAndUpdatedPositions = (stateFlow || flowStore.flow || []).map(node => {
      let updatedNode = { ...node };
      if (node.x !== undefined && node.y !== undefined && node.shapeType !== 'Line') {
        const position = positionContext.getPosition(node.name);
        if (position) {
          updatedNode.x = position.x;
          updatedNode.y = position.y;
        }
      } else if (node.xstart !== undefined && node.ystart !== undefined && node.shapeType === 'Line') {
        const position = positionContext.getPosition(node.name);
        if (position) {
          updatedNode.xstart = position.xstart;
          updatedNode.ystart = position.ystart;
          updatedNode.xend = position.xend;
          updatedNode.yend = position.yend;
        }
      }
      return updatedNode;
    });

    if (flowrunnerConnector.hasStorageProvider) {
      console.log('flowAndUpdatedPositions', flowAndUpdatedPositions);
      flowrunnerConnector.storageProvider?.saveFlow(currentFlowId as string, flowAndUpdatedPositions);
      if (onFlowHasChanged) {
        onFlowHasChanged(flowAndUpdatedPositions);
      }
      if (selectedFlow) {
        loadFlow(selectedFlow); //,true
      }
    } else {
      if (!selectedFlow) {
        return;
      }

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
  };

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
    loadFlowFromMemory,
  };
};
