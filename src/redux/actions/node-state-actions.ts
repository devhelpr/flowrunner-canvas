import { action } from 'typesafe-actions';

export const SET_NODE_STATE = 'SET_NODE_STATE';

export const CLEAR_NODE_STATES = 'CLEAR_NODE_STATES';

export const setNodeState = (nodeName: string, nodeState: string) =>
  action(SET_NODE_STATE, { nodeName: nodeName, nodeState: nodeState });
export const clearNodeState = () => action(CLEAR_NODE_STATES, {});
