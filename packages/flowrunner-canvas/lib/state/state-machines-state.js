import create from 'zustand';
let storeHandler = (set) => {
    return {
        machines: {},
        setMachineState: (machineName, newState) => set(state => {
            let clonedmachines = { ...state.machines };
            clonedmachines[machineName] = newState;
            return {
                machines: clonedmachines,
            };
        }),
        clearMachinesState: () => set(state => {
            return {
                machines: {},
            };
        }),
    };
};
export const useStateMachinesStateStore = create(set => storeHandler(set));
export const useStateMachinesStateForMultiFormStore = create(set => storeHandler(set));
//# sourceMappingURL=state-machines-state.js.map