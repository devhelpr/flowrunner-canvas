import create from 'zustand';
let storeHandler = (set) => {
    return {
        nodes: {},
        setNodeState: (nodeName, nodeState) => set(state => {
            let newNodes = { ...state.nodes };
            newNodes[nodeName] = nodeState;
            return {
                nodes: newNodes,
            };
        }),
        clearNodesState: () => set(state => {
            return {
                nodes: {},
            };
        }),
    };
};
export const useNodesStateStore = create(set => storeHandler(set));
export const useNodesStateForMultiFormStore = create(set => storeHandler(set));
//# sourceMappingURL=nodes-state.js.map