import create from 'zustand';
import { State, SetState } from 'zustand';
import { FlowToCanvas } from '../helpers/flow-to-canvas';
import produce from 'immer';
import { IStorageProvider } from '../interfaces/IStorageProvider';
import { FlowStorageProviderService } from '../services/FlowStorageProviderService';

interface IFlowState extends State {
  flow: any[];
  flowId: string;
  flowHashmap: any;
  storeFlow: (flow: any[], flowId: string) => void;
  storeFlowNode: (node: any, orgNodeName: string) => void;
  addFlowNode: (node: any) => void;
  addConnection: (connection: any) => void;
  deleteConnection: (node: any) => void;
  deleteNode: (node: any) => void;
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
        storageProvider.storeFlowPackage(get());
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

let storeHandler = (set: SetState<IFlowState>): IFlowState => {
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
    deleteNode: (node: any) =>
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
  };
};

export const useFlowStore = create<IFlowState>(handleStorageProvider(set => storeHandler(set)));
export const useFlowForMultiFormStore = create<IFlowState>(set => storeHandler(set));
