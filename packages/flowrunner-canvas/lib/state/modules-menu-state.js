import create from 'zustand';
let storeHandler = (set) => {
    return {
        isOpen: false,
        selectedModule: '',
        moduleId: '',
        moduleType: '',
        setOpen: (isOpen) => set(state => ({
            isOpen: isOpen,
        })),
        showModule: (moduleName, moduleId, moduleType) => set(state => ({
            selectedModule: moduleName,
            moduleId: moduleId || '',
            moduleType: moduleType || '',
        })),
        closeModule: () => set(state => ({
            selectedModule: '',
            moduleId: '',
            moduleType: '',
        })),
    };
};
export const useModulesStateStore = create(set => storeHandler(set));
//# sourceMappingURL=modules-menu-state.js.map