import create from 'zustand';
let storeHandler = (set) => {
    return {
        nodesTouched: {},
        setNodesTouched: (nodesTouched) => set(state => {
            return {
                nodesTouched: nodesTouched,
            };
        }),
        clearNodesTouched: () => set(state => {
            return {
                nodesTouched: {},
            };
        }),
    };
};
export const useNodesTouchedStateStore = create(set => storeHandler(set));
export const useNodesTouchedStateForMultiFormStore = create(set => storeHandler(set));
//# sourceMappingURL=nodes-touched.js.map