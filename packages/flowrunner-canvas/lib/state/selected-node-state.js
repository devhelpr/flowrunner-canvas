import create from 'zustand';
let storeHandler = (set) => {
    return {
        node: {
            name: '',
            node: undefined,
            payload: undefined,
        },
        selectNode: (nodeName, node) => set(state => {
            let newNode = {
                name: nodeName,
                node: node,
                payload: undefined,
            };
            return {
                node: newNode,
            };
        }),
        setPayload: (payload) => set(state => {
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
export const useSelectedNodeStore = create(set => storeHandler(set));
export const useSelectedNodeForMultiFormStore = create(set => storeHandler(set));
export const useBundleSelectedNodeStore = create(set => storeHandler(set));
//# sourceMappingURL=selected-node-state.js.map