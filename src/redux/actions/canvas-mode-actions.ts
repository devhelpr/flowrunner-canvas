import { action } from 'typesafe-actions';

export const SET_CONNECTING_CANVAS_MODE_NODE = 'SET_CONNECTING_CANVAS_MODE_NODE';
export const SET_SELECTED_TASK = 'SET_SELECTED_TASK';

export type setConnectiongNodeCanvasModeFunction = (enabled: boolean) => void;
export type setSelectedTaskFunction = (selectedTask: string) => void;

export const setConnectiongNodeCanvasMode: setConnectiongNodeCanvasModeFunction = enabled =>
  action(SET_CONNECTING_CANVAS_MODE_NODE, { enabled: enabled });

export const setSelectedTask: setSelectedTaskFunction = selectedTask =>
  action(SET_SELECTED_TASK, { selectedTask: selectedTask });
