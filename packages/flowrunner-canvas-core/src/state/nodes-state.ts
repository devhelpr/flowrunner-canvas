import create from 'zustand';
import { State, SetState } from 'zustand';
import produce from 'immer';

interface INodesState extends State {
  nodes: any;
  setNodeState: (nodeName: string, nodeState: string) => void;
  clearNodesState: () => void;
}

let storeHandler = (set: SetState<INodesState>): INodesState => {
  return {
    nodes: {},
    setNodeState: (nodeName: string, nodeState: string) =>
      set(state => {
        let newNodes = { ...state.nodes };
        newNodes[nodeName] = nodeState;
        return {
          nodes: newNodes,
        };
      }),
    clearNodesState: () =>
      set(state => {
        return {
          nodes: {},
        };
      }),
  };
};

export const useNodesStateStore = create<INodesState>(set => storeHandler(set));
export const useNodesStateForMultiFormStore = create<INodesState>(set => storeHandler(set));
