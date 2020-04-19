import { action } from 'typesafe-actions';

export const STORE_RAW_FLOW = 'STORE_RAW_FLOW';
export const MODIFY_RAW_FLOW = 'MODIFY_RAW_FLOW';
export const ADD_RAW_FLOW = 'ADD_RAW_FLOW';
export const ADD_RAW_CONNECTION = 'ADD_RAW_CONNECTION';
export const DELETE_CONNECTION = 'DELETE_CONNECTION';
export const DELETE_NODE = 'DELETE_NODE';
export const STORE_RAW_NODE = 'STORE_RAW_NODE';

export const storeRawFlow = (flow: any) => action(STORE_RAW_FLOW, { flow: flow });
export const modifyRawFlow = (node: any, orgNodeName: string) =>
  action(MODIFY_RAW_FLOW, { node: node, orgNodeName: orgNodeName });
export const addRawFlow = (node: any) => action(ADD_RAW_FLOW, { node: node });
export const addRawConnection = (node: any) => action(ADD_RAW_CONNECTION, { node: node });

export const deleteRawConnection = (node: any) => action(DELETE_CONNECTION, { node: node });

export const deleteRawNode = (node: any) => action(DELETE_NODE, { node: node });

export const storeRawNode = (node: any, orgNodeName: string) =>
  action(STORE_RAW_NODE, { node: node, orgNodeName: orgNodeName });
