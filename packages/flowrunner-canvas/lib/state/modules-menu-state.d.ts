import { State } from 'zustand';
interface IModulesMenuState extends State {
    isOpen: boolean;
    selectedModule: string;
    moduleId: string;
    moduleType: string;
    setOpen: (isOpen: boolean) => void;
    showModule: (moduleName: string, moduleId?: string, moduleType?: string) => void;
    closeModule: () => void;
}
export declare const useModulesStateStore: import("zustand").UseBoundStore<IModulesMenuState, import("zustand").StoreApi<IModulesMenuState>>;
export {};
