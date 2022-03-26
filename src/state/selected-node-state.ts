import create from 'zustand';
import { State, SetState } from 'zustand';

export interface ISelectedNode {
  name: string;
  node: any;
  payload: any;
}

export interface INodeState extends State {
  node: ISelectedNode | any;
  selectNode: (nodeName: string, node: any) => void;
  setPayload: (payload: any) => void;
}

let storeHandler = (set: SetState<INodeState>): INodeState => {
  return {
    node: {
      name: '',
      node: undefined,
      payload: undefined,
    },
    selectNode: (nodeName: string, node: any) =>
      set(state => {
        let newNode = {
          name: nodeName,
          node: node,
          payload: undefined,
        };
        return {
          node: newNode,
        };
      }),
    setPayload: (payload: any) =>
      set(state => {
        let newNode = {
          ...state.node,
          payload: payload,
        };
        return {
          node: newNode,
        };
      }),
  };
};

export const useSelectedNodeStore = create<INodeState>(set => storeHandler(set));
export const useSelectedNodeForMultiFormStore = create<INodeState>(set => storeHandler(set));
export const useBundleSelectedNodeStore = create<INodeState>(set => storeHandler(set));
