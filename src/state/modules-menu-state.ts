import { string } from 'prop-types';
import create from 'zustand';
import { State, SetState } from 'zustand';

interface IModulesMenuState extends State {
  isOpen: boolean;
  selectedModule: string;
  setOpen: (isOpen: boolean) => void;
  showModule: (moduleName: string) => void;
}

let storeHandler = (set: SetState<IModulesMenuState>): IModulesMenuState => {
  return {
    isOpen: false,
    selectedModule: '',

    setOpen: (isOpen: boolean) =>
      set(state => ({
        isOpen: isOpen,
      })),
    showModule: (moduleName: string) =>
      set(state => ({
        selectedModule: moduleName,
      })),
    closeModule: () => {
      set(state => ({
        selectedModule: '',
      }));
    },
  };
};

export const useModulesStateStore = create<IModulesMenuState>(set => storeHandler(set));
