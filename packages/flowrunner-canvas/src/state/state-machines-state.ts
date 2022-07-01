import create from 'zustand';
import { State, SetState } from 'zustand';

interface IStateMachinesState extends State {
  machines: any;
  setMachineState: (nodeName: string, nodeState: string) => void;
  clearMachinesState: () => void;
}

let storeHandler = (set: SetState<IStateMachinesState>): IStateMachinesState => {
  return {
    machines: {},
    setMachineState: (machineName: string, newState: string) =>
      set(state => {
        let clonedmachines = { ...state.machines };
        clonedmachines[machineName] = newState;
        return {
          machines: clonedmachines,
        };
      }),
    clearMachinesState: () =>
      set(state => {
        return {
          machines: {},
        };
      }),
  };
};

export const useStateMachinesStateStore = create<IStateMachinesState>(set => storeHandler(set));
export const useStateMachinesStateForMultiFormStore = create<IStateMachinesState>(set => storeHandler(set));
