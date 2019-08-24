import { action } from 'typesafe-actions';

export const SET_CONNECTING_CANVAS_MODE_NODE = 'SET_CONNECTING_CANVAS_MODE_NODE';

export type setConnectiongNodeCanvasModeFunction = (enabled: boolean) => void;

export const setConnectiongNodeCanvasMode: setConnectiongNodeCanvasModeFunction = enabled =>
  action(SET_CONNECTING_CANVAS_MODE_NODE, { enabled: enabled });
