import create from 'zustand';
let storeHandler = (set) => {
    return {
        layout: '{}',
        storeLayout: (layout) => set(state => ({
            layout: layout,
        })),
    };
};
export const useLayoutStore = create(set => storeHandler(set));
export const useLayoutForMultiFormStore = create(set => storeHandler(set));
//# sourceMappingURL=layout-state.js.map