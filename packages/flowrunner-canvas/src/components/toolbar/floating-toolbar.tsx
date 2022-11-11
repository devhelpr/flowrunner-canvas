import * as React from 'react';
import { ICanvasModeState, IFlowrunnerConnector, IFlowState } from '@devhelpr/flowrunner-canvas-core';
import { Subject } from 'rxjs';

export interface IFloatingToolbarProps {
  useCanvasModeStateStore: () => ICanvasModeState;
  formNodesubject?: Subject<any>;

  useFlowStore: () => IFlowState;
  flowrunnerConnector: IFlowrunnerConnector;
}

export const FloatingToolbar = (props: IFloatingToolbarProps) => {
  const canvasMode = props.useCanvasModeStateStore();
  const flow = props.useFlowStore();
  const onPointerClick = () => {
    canvasMode.setConnectiongNodeCanvasMode(false);
  };

  const onConnectClick = () => {
    canvasMode.setConnectiongNodeCanvasMode(true);
  };

  const onUndo = (event) => {
    event.preventDefault();
    if (flow.undoList.length > 0) {
      const undoNode = flow.undoList[flow.undoList.length - 1];
      flow.undoNode();
      if (undoNode.undoType === 'modify') {
        if (props.formNodesubject) {
          props.formNodesubject.next({ id: undoNode.node.name, node: undoNode.node });
        }

        props.flowrunnerConnector.modifyFlowNode(undoNode.node.name, '', '', undoNode.node.name, '', undoNode.node);
      } else if (undoNode.undoType === 'add') {
        //
      }
    }
    return false;
  };

  return (
    <div className="floating-toolbar">
      <a href="#" title="Pointer" onClick={onPointerClick} className="fas fa-mouse-pointer tw-mr-[4px]"></a>
      <a
        href="#"
        title="Connect nodes"
        onClick={onConnectClick}
        className={`tw-mr-[8px] tw-relative ${canvasMode.isConnectingNodes ? 'tw-text-blue-500' : ''}`}
      >
        <span className="far fa-square tw-text-[7px] tw-text-[8px] tw-absolute tw-top-[-7px] tw-left-[-7px]"></span>
        <span className="far fa-square tw-text-[7px] tw-top-[5px] tw-left-[5px] tw-absolute"></span>
        <span className="fas fa-arrow-up tw-text-[7px] tw-top-[-2px] tw-left-[-2px] tw-absolute tw-rotate-[135deg]"></span>
      </a>
      {flow.undoList.length > 0 && <a href="#" title="Undo" onClick={onUndo} className="fas fa-undo tw-mr-[4px]"></a>}
    </div>
  );
};
