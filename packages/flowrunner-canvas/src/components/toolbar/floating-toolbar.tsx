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
		className="fas fa-mouse-pointer tw-mr-[4px]"></a>
      <a
	  	href="#"
		  title="Connect nodes"
		  onClick={onConnectClick}
		  className={`tw-mr-[8px] tw-relative ${canvasMode.isConnectingNodes ? "tw-text-blue-500" : ""}`}>
			  <span className='far fa-square tw-text-[7px] tw-absolute tw-top-[-7px] tw-left-[-7px]'></span>
			  <span className='far fa-square tw-text-[7px] tw-top-[5px] tw-left-[5px] tw-absolute'></span>
			  <span className='fas fa-arrow-up tw-text-[7px] tw-top-[-2px] tw-left-[-2px] tw-absolute tw-rotate-[135deg]'></span>
		  </a>
    </div>
  );
};
