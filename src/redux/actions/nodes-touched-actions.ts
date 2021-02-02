import { action } from 'typesafe-actions';

export const SET_NODES_TOUCHED = 'SET_NODES_TOUCHED';

export const CLEAR_NODES_TOUCHED = 'CLEAR_NODES_TOUCHED';

export const setNodesTouched = (nodesTouched: any) => action(SET_NODES_TOUCHED, { nodesTouched: nodesTouched });
export const clearNodesTouched = () => action(CLEAR_NODES_TOUCHED, {});
