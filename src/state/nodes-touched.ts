import create from 'zustand'
import { State, SetState } from 'zustand';
import produce from 'immer';

interface INodesTouchedState extends State {
	nodesTouched : any;
	setNodesTouched: (nodesTouched: any) => void;
	clearNodesTouched: () => void;
}

let storeHandler = (set : SetState<INodesTouchedState>) : INodesTouchedState => {
	return {
		nodesTouched : {},
		setNodesTouched: (nodesTouched: any) => set(state => {
				return {
					nodesTouched : nodesTouched
				}
			}
		),
		clearNodesTouched: () => set(state => {
				return {
					nodesTouched : {}
				}
			}
		),
	}
};

export const useNodesTouchedStateStore = create<INodesTouchedState>(set => (storeHandler(set)));
export const useNodesTouchedStateForMultiFormStore = create<INodesTouchedState>(set => (storeHandler(set)));

