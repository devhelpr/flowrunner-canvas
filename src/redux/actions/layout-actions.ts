import { action } from 'typesafe-actions';
import { selectNode } from './node-actions';

export const STORE_LAYOUT = 'STORE_LAYOUT';

export const storeLayout = (layout: string) => action(STORE_LAYOUT, { layout: layout });
