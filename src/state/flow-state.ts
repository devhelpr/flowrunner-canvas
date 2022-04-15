import create from 'zustand';
import { State, SetState } from 'zustand';
import { FlowToCanvas } from '../helpers/flow-to-canvas';
import produce from 'immer';
import { IStorageProvider } from '../interfaces/IStorageProvider';
import { FlowStorageProviderService } from '../services/FlowStorageProviderService';

export interface IFlowState extends State {
  flow: any[];
  flowId: string;
  flowHashmap: any;
  storeFlow: (flow: any[], flowId: string) => void;
  storeFlowNode: (node: any, orgNodeName: string) => void;
  storeFlowNodes: (node: any) => void;
  addFlowNode: (node: any) => void;
  addFlowNodes: (nodes: any[]) => void;
  addConnection: (connection: any) => void;
  deleteConnection: (node: any) => void;
  deleteNode: (node: any, deleteLines: boolean) => void;
  deleteNodes: (nodes: any[]) => void;
}

const handleStorageProvider = config => (set, get, api) =>
  config(
    args => {
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
        console.log('PRE SAVEFLOW in handleStorageProvider');
        storageProvider.saveFlow(flowState.flowId, flowState.flow);
      }
    },
    get,
    api,
  );

/*
  TODO : handle delete/add in flowHashmap
*/

/*produce(draftState => {
          draftState.flowId = flowId;
          draftState.flowHashmap = FlowToCanvas.createFlowHashMap(flow);
          draftState.flow = FlowToCanvas.convertFlowPackageToCanvasFlow(flow);
}),*/

export const storeHandler = (set: SetState<IFlowState>): IFlowState => {
  return {
    flow: [],
    flowId: '',
    flowHashmap: new Map(),
    storeFlow: (flow: any[], flowId: string) =>
      set(state => {
        return {
          flowId: flowId,
          flowHashmap: FlowToCanvas.createFlowHashMap(flow),
          flow: FlowToCanvas.convertFlowPackageToCanvasFlow(flow),
        };
      }),
    storeFlowNode: (node: any, orgNodeName: string) =>
      set(state => {
        let flow = state.flow.map((currentNode, index) => {
          if (currentNode.name === orgNodeName) {
            const newNode = Object.assign({}, node, {
              name: node.name,
              id: node.name,
            });
            return newNode;
          } else if (currentNode.startshapeid === orgNodeName && node.shapeType !== 'Line') {
            const newNode = Object.assign({}, currentNode, {
              startshapeid: node.name,
            });
            return newNode;
          } else if (currentNode.endshapeid === orgNodeName && node.shapeType !== 'Line') {
            const newNode = Object.assign({}, currentNode, {
              endshapeid: node.name,
            });
            return newNode;
          }
          return currentNode;
        });
        console.log('storeFlowNode', node, flow);
        return {
          flow: flow,
          flowHashmap: FlowToCanvas.createFlowHashMap(flow),
        };
      }),
    storeFlowNodes: (nodes: any[]) =>
      set(state => {
        let flow = state.flow.map((currentNode, index) => {
          let _storeNode = currentNode;
          nodes.forEach(node => {
            if (currentNode.name === node.name) {
              const newNode = Object.assign({}, node, {
                name: node.name,
                id: node.name,
              });
              _storeNode = newNode;
            } else if (currentNode.startshapeid === node.name && node.shapeType !== 'Line') {
              const newNode = Object.assign({}, currentNode, {
                startshapeid: node.name,
              });
              _storeNode = newNode;
            } else if (currentNode.endshapeid === node.name && node.shapeType !== 'Line') {
              const newNode = Object.assign({}, currentNode, {
                endshapeid: node.name,
              });
              _storeNode = newNode;
            }
          });
          return _storeNode;
        });
        console.log('storeFlowNodes', nodes, flow);
        return {
          flow: flow,
          flowHashmap: FlowToCanvas.createFlowHashMap(flow),
        };
      }),
    addFlowNode: (node: any) =>
      set(state => {
        /*const flowHashmap = state.flowHashmap;
        flowHashmap.set(node.name, {
          index: state.flow.length,
          start: [] as number[],
          end: [] as number[],
        });*/
        let flow = [...state.flow, node];
        return {
          flowHashmap: FlowToCanvas.createFlowHashMap(flow),
          flow: flow,
        };
      }),
    addFlowNodes: (nodes: any[]) =>
      set(state => {
        let flow = [...state.flow, ...nodes];
        return {
          flowHashmap: FlowToCanvas.createFlowHashMap(flow),
          flow: flow,
        };
      }),
    addConnection: (connection: any) =>
      set(state => {
        /*const flowHashmap = state.flowHashmap;
        if (flowHashmap.has(connection.startshapeid)) {
          let copy = {...flowHashmap.get(connection.startshapeid)};
          copy.start.push(state.flow.length);
          flowHashmap.set(connection.startshapeid, copy);
          //startNode.start.push(index);
        } else {
          flowHashmap.set(connection.startshapeid, {
            index: -1,
            start: [state.flow.length] as number[],
            end: [] as number[],
          });
        }

        if (flowHashmap.has(connection.endshapeid)) {
          let copy = {...flowHashmap.get(connection.endshapeid)};
          copy.end.push(state.flow.length);
          flowHashmap.set(connection.endshapeid, copy);
        } else {
          flowHashmap.set(connection.endshapeid, {
            index: -1,
            start: [] as number[],
            end: [state.flow.length] as number[],
          });
        }
        */

        let flow = [...state.flow, connection];
        return {
          flowHashmap: FlowToCanvas.createFlowHashMap(flow),
          flow: flow,
        };
      }),
    deleteConnection: (node: any) =>
      set(
        produce(draftState => {
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
        }),
      ),
    deleteNode: (node: any, deleteLines: boolean) =>
      set(state => {
        let index = -1;
        /*draftState.flow.map((draftNode, mapIndex) => {
            if (draftNode.name === node.name) {
              index = mapIndex;
            }
          });
          */
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
          } else if (draftNode.endshapeid === node.name) {
            let updatedNode = { ...draftNode };
            updatedNode.endshapeid = undefined;
            return updatedNode;
          }
          return draftNode;
        });
        //if (index >= 0) {
        //  draftState.flow.splice(index, 1);
        //  draftState.flowHashmap = FlowToCanvas.createFlowHashMap(draftState.flow);
        // }

        return {
          flowHashmap: FlowToCanvas.createFlowHashMap(flow),
          flow: flow,
        };
      }),
    deleteNodes: (nodes: any[]) => {
      set(state => {
        let index = -1;
        const isNodeInList = nodeName => {
          return (
            nodes.findIndex(node => {
              return node.name === nodeName;
            }) >= 0
          );
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

export const useFlowStore = create<IFlowState>(handleStorageProvider(set => storeHandler(set)));
export const useFlowForMultiFormStore = create<IFlowState>(set => storeHandler(set));
export const useBundleFlowStore = create<IFlowState>(set => storeHandler(set));
