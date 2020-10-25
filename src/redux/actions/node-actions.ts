import { action } from 'typesafe-actions';

export const SELECT_NODE = 'SELECT_NODE';

export const SET_PAYLOAD = 'SET_PAYLOAD';

export const selectNode = (nodeName: string, node: any) => action(SELECT_NODE, { nodeName: nodeName, node: node });
export const setPayload = (nodeName: string, payload: any) =>
  action(SET_PAYLOAD, { nodeName: nodeName, payload: payload });
