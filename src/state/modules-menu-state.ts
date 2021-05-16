import { string } from 'prop-types';
import create from 'zustand';
import { State, SetState } from 'zustand';

interface IModulesMenuState extends State {
  isOpen: boolean;
  selectedModule: string;
  moduleId: string;
  setOpen: (isOpen: boolean) => void;
  showModule: (moduleName: string, moduleId?: string) => void;
}

let storeHandler = (set: SetState<IModulesMenuState>): IModulesMenuState => {
  return {
    isOpen: false,
    selectedModule: '',
    moduleId: '',

    setOpen: (isOpen: boolean) =>
      set(state => ({
        isOpen: isOpen,
      })),
    showModule: (moduleName: string, moduleId?: string) =>
      set(state => ({
        selectedModule: moduleName,
        moduleId: moduleId || ""
      })),
    closeModule: () => {
      set(state => ({
        selectedModule: '',
      }));
    },
  };
};

export const useModulesStateStore = create<IModulesMenuState>(set => storeHandler(set));
