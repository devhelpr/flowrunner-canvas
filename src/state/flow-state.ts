import create from 'zustand';
import { State, SetState } from 'zustand';
import { FlowToCanvas } from '../helpers/flow-to-canvas';
import produce from 'immer';

interface IFlowState extends State {
  flow: any[];
  flowId : string;

  storeFlow: (flow: any[], flowId : string) => void;
  storeFlowNode: (node: any, orgNodeName: string) => void;
  addFlowNode: (node: any) => void;
  addConnection: (connection: any) => void;
  deleteConnection: (node: any) => void;
  deleteNode: (node: any) => void;
}

let storeHandler = (set: SetState<IFlowState>): IFlowState => {
  return {
    flow: [],
    flowId: "",
    storeFlow: (flow: any[], flowId : string) =>
      set(
        produce(draftState => {
          draftState.flowId = flowId;
          draftState.flow = FlowToCanvas.convertFlowPackageToCanvasFlow(flow);
        }),
      ),
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
        return { flow: flow };
      }),
    addFlowNode: (node: any) =>
      set(state => {
        return {
          flow: [...state.flow, node],
        };
      }),
    addConnection: (connection: any) =>
      set(state => {
        return {
          flow: [...state.flow, connection],
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
          }
        }),
      ),
  };
};

export const useFlowStore = create<IFlowState>(set => storeHandler(set));
export const useFlowForMultiFormStore = create<IFlowState>(set => storeHandler(set));
