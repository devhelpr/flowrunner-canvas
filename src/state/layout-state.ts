import create from 'zustand'
import { State, SetState } from 'zustand';

interface ILayoutState extends State {
	layout : string;
	storeLayout: (layout: string) => void;
}

let storeHandler = (set : SetState<ILayoutState>) : ILayoutState => {
	return {
		layout : "{}",
		storeLayout: (layout: string) => set(state => ({
				layout : layout
			})
		)
	}
};

export const useLayoutStore = create<ILayoutState>(set => (storeHandler(set)));
export const useLayoutForMultiFormStore = create<ILayoutState>(set => (storeHandler(set)));

