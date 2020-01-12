import { action } from 'typesafe-actions';

export const STORE_RAW_FLOW = 'STORE_RAW_FLOW';

export const storeRawFlow = (flow: any) => action(STORE_RAW_FLOW, { flow: flow });
