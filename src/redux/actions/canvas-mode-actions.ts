import { action } from 'typesafe-actions';

export const SET_CONNECTING_CANVAS_MODE_NODE = 'SET_CONNECTING_CANVAS_MODE_NODE';
export const SET_SELECTED_TASK = 'SET_SELECTED_TASK';
export const SET_SHOWDEPENDENCIES = 'SET_SHOWDEPENDENCIES';
export const SET_ALLOWINPUTTOHTMLNODES = 'SET_ALLOWINPUTTOHTMLNODES';
export const SET_FLOWRUNNERPAUSED = 'SET_FLOWRUNNERPAUSED';

export type setConnectiongNodeCanvasModeFunction = (enabled: boolean) => void;
export type setSelectedTaskFunction = (selectedTask: string) => void;
export type setShowDependenciesFunction = (showDependencies: boolean) => void;
export type setAllowInputToHtmlNodesFunction = (allowInputToHtmlNodes: boolean) => void;
export type setFlowrunnerPausedFunction = (paused: boolean) => void;


export const setConnectiongNodeCanvasMode: setConnectiongNodeCanvasModeFunction = enabled =>
  action(SET_CONNECTING_CANVAS_MODE_NODE, { enabled: enabled });

export const setSelectedTask: setSelectedTaskFunction = selectedTask =>
  action(SET_SELECTED_TASK, { selectedTask: selectedTask });

export const setShowDependencies: setShowDependenciesFunction = showDependencies =>
  action(SET_SHOWDEPENDENCIES, { showDependencies: showDependencies });

export const setAllowInputToHtmlNodes: setAllowInputToHtmlNodesFunction = allowInputToHtmlNodes =>
  action(SET_ALLOWINPUTTOHTMLNODES, { allowInputToHtmlNodes: allowInputToHtmlNodes });

export const setFlowrunnerPaused: setFlowrunnerPausedFunction = paused =>
  action(SET_FLOWRUNNERPAUSED, { paused: paused });
