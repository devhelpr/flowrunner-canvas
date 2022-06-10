import * as React from 'react';
import { ICanvasModeState } from '../../state/canvas-mode-state';

export interface IFloatingToolbarProps {
  useCanvasModeStateStore: () => ICanvasModeState;
}

export const FloatingToolbar = (props: IFloatingToolbarProps) => {
  const canvasMode = props.useCanvasModeStateStore();

  const onPointerClick = () => {
    canvasMode.setConnectiongNodeCanvasMode(false);
  };

  const onConnectClick = () => {
    canvasMode.setConnectiongNodeCanvasMode(true);
  };

  return (
    <div className="floating-toolbar">
      <a
	  	href="#" 
		title="Pointer"
		onClick={onPointerClick}
		className="fas fa-mouse-pointer"></a>
      <a
	  	href="#"
		  title="Connect nodes"
		  onClick={onConnectClick}
		  className={`fas fa-bezier-curve ${canvasMode.isConnectingNodes ? "tw-text-blue-500" : ""}`}></a>
    </div>
  );
};
