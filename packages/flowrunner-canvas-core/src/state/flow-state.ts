import create from 'zustand';
import { State, SetState } from 'zustand';
import { FlowToCanvas } from '../helpers/flow-to-canvas';
import { IStorageProvider } from '../interfaces/IStorageProvider';
import { FlowStorageProviderService } from '../services/FlowStorageProviderService';
import { IPosition, IPositionContext } from '../contexts/position-context';
import { TFlowMap } from '../interfaces/IFlowMap';
import { IUndoConnectionMode, IUndoNode } from '../interfaces/IUndoNode';
import { storeFlowNode } from './handle-flow-state';
import { deleteFlowNode } from './handle-flow-state/delete-flow-node';
import { addFlowNode } from './handle-flow-state/add-flow-node';
import { connectFlowNode } from './handle-flow-state/connect-flow-node';

export interface IFlowState extends State {
  undoList: IUndoNode[];
  redoList: IUndoNode[];
  flow: any[];
  flowId: string;
  flowHashmap: TFlowMap;
  storeFlow: (flow: any[], flowId: string, positionContext?: IPositionContext) => void;
  storeFlowNode: (node: any, orgNodeName: string, positionContext?: IPositionContext) => void;
  storeFlowNodes: (node: any, positionContext?: IPositionContext) => void;
  addFlowNode: (node: any, positionContext?: IPositionContext) => void;
  addFlowNodes: (nodes: any[], positionContext?: IPositionContext) => void;
  addConnection: (connection: any, positionContext?: IPositionContext) => void;
  deleteConnection: (node: any) => void;
  deleteNode: (node: any, deleteLines: boolean) => void;
  deleteNodes: (nodes: any[]) => void;
  undoNode: () => void;
}

const handleStorageProvider = (config) => (set, get, api) =>
  config(
    (args) => {
      // pre setstate

      // set state
      set(args);

      // after setstate
      let hasStorageProvider = false;

      let storageProvider: IStorageProvider | undefined = undefined;
      if (FlowStorageProviderService.getIsFlowStorageProviderEnabled()) {
        storageProvider = FlowStorageProviderService.getFlowStorageProvider();
        hasStorageProvider = true;
      }

      if (storageProvider) {
        let flowState = get();

        console.log('PRE SAVEFLOW in handleStorageProvider', flowState.flow);
        if (storageProvider.isAsync) {
          return storageProvider.saveFlow(flowState.flowId, flowState.flow);
        } else {
          storageProvider.saveFlow(flowState.flowId, flowState.flow);
        }
      }
    },
    get,
    api,
  );

export const storeHandler = (set: SetState<IFlowState>): IFlowState => {
  return {
    undoList: [],
    redoList: [],
    flow: [],
    flowId: '',
    flowHashmap: new Map(),
    undoNode: () =>
      set((state) => {
        let undoList = [...state.undoList];
        console.log('undoList', undoList);
        if (undoList.length > 0) {
          const undoNode = undoList.pop();

          if (undoNode && undoNode.undoType === 'add') {
            let result = addFlowNode(undoNode.node.name, undoNode.node, state.flow);
            if (undoNode.connections && undoNode.connectionMode === IUndoConnectionMode.addConnection) {
              undoNode.connections.forEach((connection) => {
                result = addFlowNode(connection.name, connection, result.flow);
              });
            } else if (undoNode.connections && undoNode.connectionMode === IUndoConnectionMode.reconnect) {
              undoNode.connections.forEach((connection) => {
                if (connection.startshapeid === undoNode.node.name || connection.endshapeid === undoNode.node.name) {
                  result.flow = connectFlowNode(undoNode.node.name, connection, result.flow);
                }
              });
            }
            return {
              undoList: undoList,
              flow: result.flow,
              flowHashmap: FlowToCanvas.createFlowHashMap(result.flow),
            };
          } else if (undoNode && undoNode.undoType === 'delete') {
            const result = deleteFlowNode(undoNode.node.name, undoNode.node, false, state.flow);
            return {
              undoList: undoList,
              flow: result.flow,
              flowHashmap: FlowToCanvas.createFlowHashMap(result.flow),
            };
          } else if (undoNode && undoNode.undoType === 'modify') {
            console.log('undo', undoNode);
            const result = storeFlowNode(undoNode.node.name, undoNode.node, undefined, state.flow);

            return {
              undoList: undoList,
              flow: result.flow,
              flowHashmap: FlowToCanvas.createFlowHashMap(result.flow),
            };
          }
        }

        return {
          undoList: undoList,
          flow: state.flow,
          flowHashmap: state.flowHashmap,
        };
      }),
    storeFlow: (flow: any[], flowId: string, positionContext?: IPositionContext) =>
      set((state) => {
        return {
          flowId: flowId,
          flowHashmap: FlowToCanvas.createFlowHashMap(flow),
          flow: FlowToCanvas.convertFlowPackageToCanvasFlow(flow, positionContext),
        };
      }),
    storeFlowNode: (node: any, orgNodeName: string, positionContext?: IPositionContext) =>
      set((state) => {
        let position: IPosition | undefined = undefined;
        if (positionContext) {
          position = positionContext.positions.get(orgNodeName);
        }
        const result = storeFlowNode(orgNodeName, node, position, state.flow);
        let undoList = state.undoList;
        if (result.undoNode) {
          console.log('push node to undoList', result.undoNode);
          undoList = [...state.undoList, result.undoNode];
        }
        return {
          undoList: undoList,
          flow: result.flow,
          flowHashmap: FlowToCanvas.createFlowHashMap(result.flow),
        };
      }),
    storeFlowNodes: (nodes: any[], positionContext?: IPositionContext) =>
      set((state) => {
        let flow = state.flow.map((currentNode, index) => {
          let _storeNode = currentNode;
          nodes.forEach((node) => {
            let position: IPosition | undefined = undefined;
            if (positionContext) {
              position = positionContext.positions.get(node.name);
            }

            if (currentNode.name === node.name) {
              const newNode = Object.assign(
                {},
                node,
                {
                  name: node.name,
                  id: node.name,
                },
                position,
              );
              _storeNode = newNode;
            } else if (currentNode.startshapeid === node.name && node.shapeType !== 'Line') {
              const newNode = Object.assign(
                {},
                currentNode,
                {
                  startshapeid: node.name,
                },
                position,
              );
              _storeNode = newNode;
            } else if (currentNode.endshapeid === node.name && node.shapeType !== 'Line') {
              const newNode = Object.assign(
                {},
                currentNode,
                {
                  endshapeid: node.name,
                },
                position,
              );
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
    addFlowNode: (node: any, positionContext?: IPositionContext) =>
      set((state) => {
        const result = addFlowNode(node.name, node, state.flow);
        const undoList = [...state.undoList, result.undoNode];
        return {
          undoList: undoList,
          flowHashmap: FlowToCanvas.createFlowHashMap(result.flow),
          flow: result.flow,
        };
      }),
    addFlowNodes: (nodes: any[], positionContext?: IPositionContext) =>
      set((state) => {
        let flow = [...state.flow, ...nodes];
        return {
          flowHashmap: FlowToCanvas.createFlowHashMap(flow),
          flow: flow,
        };
      }),
    addConnection: (connection: any, positionContext?: IPositionContext) =>
      set((state) => {
        const result = addFlowNode(connection.name, connection, state.flow);
        const undoList = [...state.undoList, result.undoNode];
        return {
          flowHashmap: FlowToCanvas.createFlowHashMap(result.flow),
          flow: result.flow,
          undoList: undoList,
        };
      }),
    deleteConnection: (node: any) =>
      set((state) => {
        let undoList = state.undoList;
        let index = -1;
        state.flow.forEach((currentNode, mapIndex) => {
          if (currentNode.name === node.name) {
            index = mapIndex;

            undoList = [
              ...state.undoList,
              {
                node: {
                  ...currentNode,
                },
                connections: [],
                undoType: 'add',
              },
            ];
          }
        });

        let flow = [...state.flow];
        if (index >= 0) {
          flow.splice(index, 1);
        }
        return {
          flowHashmap: FlowToCanvas.createFlowHashMap(flow),
          flow: flow,
          undoList: undoList,
        };
      }),
    deleteNode: (node: any, deleteLines: boolean) =>
      set((state) => {
        const result = deleteFlowNode(node.name, node, deleteLines, state.flow);

        let undoList = state.undoList;
        if (result.undoNode) {
          undoList = [...state.undoList, result.undoNode];
        }
        return {
          flowHashmap: FlowToCanvas.createFlowHashMap(result.flow),
          flow: result.flow,
          undoList: undoList,
        };
      }),
    deleteNodes: (nodes: any[]) => {
      set((state) => {
        let index = -1;
        const isNodeInList = (nodeName) => {
          return (
            nodes.findIndex((node) => {
              return node.name === nodeName;
            }) >= 0
          );
        };
        let flow = state.flow.filter((draftNode) => {
          if (isNodeInList(draftNode.name)) {
            return false;
          }
          if (isNodeInList(draftNode.startshapeid) || isNodeInList(draftNode.endshapeid)) {
            return false;
          }
          return true;
        });
        flow = flow.map((draftNode) => {
          if (isNodeInList(draftNode.startshapeid)) {
            let updatedNode = { ...draftNode };
            updatedNode.startshapeid = undefined;

            if (isNodeInList(draftNode.endshapeid)) {
              updatedNode.endshapeid = undefined;
            }
            return updatedNode;
          } else if (isNodeInList(draftNode.endshapeid)) {
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

export const useFlowStore = create<IFlowState>(handleStorageProvider((set) => storeHandler(set)));
export const useFlowForMultiFormStore = create<IFlowState>((set) => storeHandler(set));
export const useBundleFlowStore = create<IFlowState>((set) => storeHandler(set));
