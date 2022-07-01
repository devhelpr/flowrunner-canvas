import { useEffect, useState } from 'react';
import fetch from 'cross-fetch';
import { useLayoutStore } from './state/layout-state';
import { useCanvasModeStateStore } from './state/canvas-mode-state';
import { usePositionContext } from './components/contexts/position-context';
export var FlowState;
(function (FlowState) {
    FlowState[FlowState["idle"] = 0] = "idle";
    FlowState[FlowState["loading"] = 1] = "loading";
    FlowState[FlowState["loaded"] = 2] = "loaded";
    FlowState[FlowState["error"] = 3] = "error";
})(FlowState || (FlowState = {}));
export const useFlows = (flowrunnerConnector, useFlowStore, flowId, onFlowHasChanged) => {
    const positionContext = usePositionContext();
    const [flowState, setFlowState] = useState(FlowState.idle);
    const [currentFlowId, setCurrentFlowId] = useState(flowId);
    const [flow, setFlow] = useState([]);
    const [flows, setFlows] = useState([]);
    const [flowType, setFlowType] = useState('');
    const flowStore = useFlowStore();
    const layout = useLayoutStore();
    const setCanvasFlowType = useCanvasModeStateStore(state => state.setFlowType);
    const canvasflowType = useCanvasModeStateStore(state => state.flowType);
    const getFlows = (getFlowId) => {
        var _a, _b, _c;
        if (flowrunnerConnector.hasStorageProvider) {
            if ((_a = flowrunnerConnector.storageProvider) === null || _a === void 0 ? void 0 : _a.isAsync) {
                ((_b = flowrunnerConnector.storageProvider) === null || _b === void 0 ? void 0 : _b.getFlows())
                    .then((flows) => {
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
            }
            else {
                const flows = (_c = flowrunnerConnector.storageProvider) === null || _c === void 0 ? void 0 : _c.getFlows();
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
                let loadFlowId = flowId === undefined && flows ? flows[0].id : currentFlowId;
                if (getFlowId) {
                    loadFlowId = getFlowId;
                }
                loadFlow(loadFlowId);
            }
        })
            .catch(err => {
            console.error(err);
        });
    };
    const loadFlow = (flowId) => {
        setCurrentFlowId(flowId);
        setFlowState(FlowState.loading);
    };
    const reloadFlow = () => {
        setFlowState(FlowState.loading);
    };
    const loadFlowFromMemory = (inputFlow, flowId) => {
        setFlowState(FlowState.loading);
        setTimeout(() => {
            setCurrentFlowId(flowId);
            setFlowType('playground');
            flowStore.storeFlow(inputFlow, currentFlowId);
            setFlow(inputFlow);
            setFlowState(FlowState.loaded);
        }, 10);
    };
    useEffect(() => {
        var _a, _b, _c;
        if (!currentFlowId) {
            return;
        }
        if (flowState == FlowState.loading) {
            if (flowrunnerConnector.hasStorageProvider) {
                if ((_a = flowrunnerConnector.storageProvider) === null || _a === void 0 ? void 0 : _a.isAsync) {
                    ((_b = flowrunnerConnector.storageProvider) === null || _b === void 0 ? void 0 : _b.getFlow(currentFlowId)).then(flowPackage => {
                        console.log('LOAD FLOW', currentFlowId, flowPackage);
                        positionContext.clearPositions();
                        flowrunnerConnector.setFlowType(flowPackage.flowType || 'playground');
                        setFlowType(flowPackage.flowType || 'playground');
                        setCanvasFlowType(flowPackage.flowType || 'playground');
                        flowStore.storeFlow(flowPackage.flow, currentFlowId);
                        setFlow(flowPackage.flow);
                        layout.storeLayout(JSON.stringify(flowPackage.layout));
                        setFlowState(FlowState.loaded);
                    });
                }
                else {
                    positionContext.clearPositions();
                    const flowPackage = (_c = flowrunnerConnector.storageProvider) === null || _c === void 0 ? void 0 : _c.getFlow(currentFlowId);
                    flowrunnerConnector.setFlowType(flowPackage.flowType || 'playground');
                    setFlowType(flowPackage.flowType || 'playground');
                    setCanvasFlowType(flowPackage.flowType || 'playground');
                    flowStore.storeFlow(flowPackage.flow, currentFlowId);
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
                flowStore.storeFlow(flowPackage.flow, currentFlowId);
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
    const onGetFlows = (id) => {
        setCurrentFlowId(id);
        getFlows(id);
    };
    useEffect(() => {
        console.log('useeffect use-flows', flowStore.flow);
    }, [flowStore.flow]);
    const saveFlow = (selectedFlow, stateFlow) => {
        var _a;
        console.log('SAVE FLOW', stateFlow, flowStore.flow);
        const flowAndUpdatedPositions = (stateFlow || flowStore.flow || []).map(node => {
            let updatedNode = { ...node };
            if (node.x !== undefined && node.y !== undefined && node.shapeType !== 'Line') {
                const position = positionContext.getPosition(node.name);
                if (position) {
                    updatedNode.x = position.x;
                    updatedNode.y = position.y;
                }
            }
            else if (node.xstart !== undefined && node.ystart !== undefined && node.shapeType === 'Line') {
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
            (_a = flowrunnerConnector.storageProvider) === null || _a === void 0 ? void 0 : _a.saveFlow(currentFlowId, flowAndUpdatedPositions);
            if (onFlowHasChanged) {
                onFlowHasChanged(flowAndUpdatedPositions);
            }
            if (selectedFlow) {
                loadFlow(selectedFlow);
            }
        }
        else {
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
                    loadFlow(selectedFlow);
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
//# sourceMappingURL=use-flows.js.map