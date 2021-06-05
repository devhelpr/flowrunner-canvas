import { string } from 'prop-types';
import create from 'zustand';
import { State, SetState } from 'zustand';

interface IModulesMenuState extends State {
  isOpen: boolean;
  selectedModule: string;
  moduleId: string;
  moduleType: string;
  setOpen: (isOpen: boolean) => void;
  showModule: (moduleName: string, moduleId?: string, moduleType?: string) => void;
  closeModule: () => void;
}

let storeHandler = (set: SetState<IModulesMenuState>): IModulesMenuState => {
  return {
    isOpen: false,
    selectedModule: '',
    moduleId: '',
    moduleType: '',
    setOpen: (isOpen: boolean) =>
      set(state => ({
        isOpen: isOpen,
      })),
    showModule: (moduleName: string, moduleId?: string, moduleType?: string) =>
      set(state => ({
        selectedModule: moduleName,
        moduleId: moduleId || '',
        moduleType: moduleType || ''
      })),
    closeModule: () =>
      set(state => ({
        selectedModule: '',
        moduleId: '',
        moduleType: ''
      }))    
  };
};

export const useModulesStateStore = create<IModulesMenuState>(set => storeHandler(set));
