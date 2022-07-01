import create from 'zustand';
import { FlowToCanvas } from '../helpers/flow-to-canvas';
import produce from 'immer';
import { FlowStorageProviderService } from '../services/FlowStorageProviderService';
const handleStorageProvider = config => (set, get, api) => config(args => {
    set(args);
    let hasStorageProvider = false;
    let storageProvider = undefined;
    if (FlowStorageProviderService.getIsFlowStorageProviderEnabled()) {
        storageProvider = FlowStorageProviderService.getFlowStorageProvider();
        hasStorageProvider = true;
    }
    if (storageProvider) {
        let flowState = get();
        console.log('PRE SAVEFLOW in handleStorageProvider', flowState.flow);
        storageProvider.saveFlow(flowState.flowId, flowState.flow);
    }
}, get, api);
export const storeHandler = (set) => {
    return {
        flow: [],
        flowId: '',
        flowHashmap: new Map(),
        storeFlow: (flow, flowId, positionContext) => set(state => {
            return {
                flowId: flowId,
                flowHashmap: FlowToCanvas.createFlowHashMap(flow),
                flow: FlowToCanvas.convertFlowPackageToCanvasFlow(flow, positionContext),
            };
        }),
        storeFlowNode: (node, orgNodeName, positionContext) => set(state => {
            let position = undefined;
            if (positionContext) {
                position = positionContext.positions.get(orgNodeName);
            }
            let flow = state.flow.map((currentNode, index) => {
                if (currentNode.name === orgNodeName) {
                    const newNode = Object.assign({}, node, {
                        name: node.name,
                        id: node.name,
                    }, position);
                    return newNode;
                }
                else if (currentNode.startshapeid === orgNodeName && node.shapeType !== 'Line') {
                    const newNode = Object.assign({}, currentNode, {
                        startshapeid: node.name,
                    }, position);
                    return newNode;
                }
                else if (currentNode.endshapeid === orgNodeName && node.shapeType !== 'Line') {
                    const newNode = Object.assign({}, currentNode, {
                        endshapeid: node.name,
                    }, position);
                    return newNode;
                }
                return currentNode;
            });
            return {
                flow: flow,
                flowHashmap: FlowToCanvas.createFlowHashMap(flow),
            };
        }),
        storeFlowNodes: (nodes, positionContext) => set(state => {
            let flow = state.flow.map((currentNode, index) => {
                let _storeNode = currentNode;
                nodes.forEach(node => {
                    let position = undefined;
                    if (positionContext) {
                        position = positionContext.positions.get(node.name);
                    }
                    if (currentNode.name === node.name) {
                        const newNode = Object.assign({}, node, {
                            name: node.name,
                            id: node.name,
                        }, position);
                        _storeNode = newNode;
                    }
                    else if (currentNode.startshapeid === node.name && node.shapeType !== 'Line') {
                        const newNode = Object.assign({}, currentNode, {
                            startshapeid: node.name,
                        }, position);
                        _storeNode = newNode;
                    }
                    else if (currentNode.endshapeid === node.name && node.shapeType !== 'Line') {
                        const newNode = Object.assign({}, currentNode, {
                            endshapeid: node.name,
                        }, position);
                        _storeNode = newNode;
                    }
                });
                return _storeNode;
            });
            return {
                flow: flow,
                flowHashmap: FlowToCanvas.createFlowHashMap(flow),
            };
        }),
        addFlowNode: (node, positionContext) => set(state => {
            let flow = [...state.flow, node];
            return {
                flowHashmap: FlowToCanvas.createFlowHashMap(flow),
                flow: flow,
            };
        }),
        addFlowNodes: (nodes, positionContext) => set(state => {
            let flow = [...state.flow, ...nodes];
            return {
                flowHashmap: FlowToCanvas.createFlowHashMap(flow),
                flow: flow,
            };
        }),
        addConnection: (connection, positionContext) => set(state => {
            let flow = [...state.flow, connection];
            return {
                flowHashmap: FlowToCanvas.createFlowHashMap(flow),
                flow: flow,
            };
        }),
        deleteConnection: (node) => set(produce(draftState => {
            let index = -1;
            draftState.flow.map((draftNode, mapIndex) => {
                if (draftNode.name === node.name) {
                    index = mapIndex;
                }
            });
            if (index >= 0) {
                draftState.flow.splice(index, 1);
                draftState.flowHashmap = FlowToCanvas.createFlowHashMap(draftState.flow);
            }
        })),
        deleteNode: (node, deleteLines) => set(state => {
            let index = -1;
            let flow = state.flow.filter(draftNode => {
                if (draftNode.name === node.name) {
                    return false;
                }
                if (draftNode.startshapeid === node.name || draftNode.endshapeid === node.name) {
                    if (!!deleteLines) {
                        return false;
                    }
                    return true;
                }
                return true;
            });
            flow = flow.map(draftNode => {
                if (draftNode.startshapeid === node.name) {
                    let updatedNode = { ...draftNode };
                    updatedNode.startshapeid = undefined;
                    if (draftNode.endshapeid === node.name) {
                        updatedNode.endshapeid = undefined;
                    }
                    return updatedNode;
                }
                else if (draftNode.endshapeid === node.name) {
                    let updatedNode = { ...draftNode };
                    updatedNode.endshapeid = undefined;
                    return updatedNode;
                }
                return draftNode;
            });
            return {
                flowHashmap: FlowToCanvas.createFlowHashMap(flow),
                flow: flow,
            };
        }),
        deleteNodes: (nodes) => {
            set(state => {
                let index = -1;
                const isNodeInList = nodeName => {
                    return (nodes.findIndex(node => {
                        return node.name === nodeName;
                    }) >= 0);
                };
                let flow = state.flow.filter(draftNode => {
                    if (isNodeInList(draftNode.name)) {
                        return false;
                    }
                    if (isNodeInList(draftNode.startshapeid) || isNodeInList(draftNode.endshapeid)) {
                        return false;
                    }
                    return true;
                });
                flow = flow.map(draftNode => {
                    if (isNodeInList(draftNode.startshapeid)) {
                        let updatedNode = { ...draftNode };
                        updatedNode.startshapeid = undefined;
                        if (isNodeInList(draftNode.endshapeid)) {
                            updatedNode.endshapeid = undefined;
                        }
                        return updatedNode;
                    }
                    else if (isNodeInList(draftNode.endshapeid)) {
                        let updatedNode = { ...draftNode };
                        updatedNode.endshapeid = undefined;
                        return updatedNode;
                    }
                    return draftNode;
                });
                return {
                    flowHashmap: FlowToCanvas.createFlowHashMap(flow),
                    flow: flow,
                };
            });
        },
    };
};
export const useFlowStore = create(handleStorageProvider(set => storeHandler(set)));
export const useFlowForMultiFormStore = create(set => storeHandler(set));
export const useBundleFlowStore = create(set => storeHandler(set));
//# sourceMappingURL=flow-state.js.map