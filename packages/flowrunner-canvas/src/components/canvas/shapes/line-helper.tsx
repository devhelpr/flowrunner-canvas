import * as React from 'react';
import { useMemo, useRef } from 'react';
import { Line } from './line';
import { FlowToCanvas } from '@devhelpr/flowrunner-canvas-core';
import { ErrorBoundary } from '@devhelpr/flowrunner-canvas-core';
import { ThumbPositionRelativeToNode } from '@devhelpr/flowrunner-canvas-core';
import { usePositionContext } from '@devhelpr/flowrunner-canvas-core';
import { IFlowState } from '@devhelpr/flowrunner-canvas-core';

export interface ILineHelperProps {
  endshapeid: string;
  startshapeid: string;
  node;
  lineNode;
  getNodeInstance: any;
  canvasHasSelectedNode: boolean;
  isSelected: boolean;
  selectedNode: any;
  shapeRefs;
  onLineMouseOver;
  onLineMouseOut;
  onClickLine;
  touchedNodes;
  newStartPosition;
  onMouseStart: any;
  onMouseMove: any;
  onMouseEnd: any;

  useFlowStore: () => IFlowState;

  onMouseConnectionStartOver?: any;
  onMouseConnectionStartOut?: any;
  onMouseConnectionStartStart?: any;
  onMouseConnectionStartMove?: any;
  onMouseConnectionStartEnd?: any;

  onMouseConnectionEndOver?: any;
  onMouseConnectionEndOut?: any;
  onMouseConnectionEndStart?: any;
  onMouseConnectionEndMove?: any;
  onMouseConnectionEndEnd?: any;
  onMouseConnectionEndLeave?: any;
}

export const LineHelper = (props: ILineHelperProps) => {
  const flow = props.useFlowStore();
  const positionContext = usePositionContext();

  const endNode = useMemo(() => {
    const item = flow.flowHashmap.get(props.endshapeid);
    if (!item) {
      return false;
    }
    const endIndex = item.index;
    if (endIndex < 0) {
      return false;
    }
    return flow.flow[endIndex];
  }, [props.node.name, flow, flow.flowHashmap, props.endshapeid]);

  const startNode = useMemo(() => {
    const item = flow.flowHashmap.get(props.startshapeid);
    if (!item) {
      return false;
    }
    const startIndex = item.index;
    if (startIndex < 0) {
      return false;
    }
    return flow.flow[startIndex];
  }, [props.node.name, flow, flow.flowHashmap, props.startshapeid]);

  /*
	const endNodes = useMemo(() => { 
		return props.flow.filter((node) => {
			return node.name == props.endshapeid;
		});
	}, [props.flow, props.node.name, props.endshapeid]);
	if (endNodes.length == 0) {
		return null;
	}
	let endNode = endNodes[0];
	*/
  let newEndPosition = {
    x: 0,
    y: 0,
  };

  if (endNode) {
    let positionNode = positionContext.getPosition(endNode.name) || endNode;
    let startPositionNode = positionContext.getPosition(startNode.name) || endNode;
    newEndPosition = FlowToCanvas.getEndPointForLine(
      endNode,
      {
        x: positionNode.x,
        y: positionNode.y,
      },
      startNode,
      startPositionNode,
      props.getNodeInstance,
      (props.lineNode.thumbEndPosition as ThumbPositionRelativeToNode) || ThumbPositionRelativeToNode.default,
    );
  } else {
    let position = positionContext.getPosition(props.lineNode.name);
    if (!position) {
      positionContext.setPosition(props.lineNode.name, {
        xstart: props.lineNode.xstart,
        ystart: props.lineNode.ystart,
        xend: props.lineNode.xend,
        yend: props.lineNode.yend,
      });
      position = positionContext.getPosition(props.lineNode.name);
    }
    if (position) {
      newEndPosition = {
        x: position.xend || 0,
        y: position.yend || 0,
      };
    }
  }

  return (
    <Line
      ref={(ref) => (props.shapeRefs.current[props.lineNode.name] = ref)}
      onMouseOver={(event) => props.onLineMouseOver(props.lineNode, event)}
      onMouseOut={(event) => props.onLineMouseOut(props.lineNode, event)}
      onClickLine={(event) => props.onClickLine(props.lineNode, event)}
      canvasHasSelectedNode={props.canvasHasSelectedNode}
      isSelected={false}
      onMouseStart={props.onMouseStart}
      onMouseMove={props.onMouseMove}
      onMouseEnd={props.onMouseEnd}
      lineNode={props.lineNode}
      shapeRefs={props.shapeRefs.current}
      isErrorColor={props.lineNode.followflow === 'onfailure'}
      isSuccessColor={props.lineNode.followflow === 'onsuccess'}
      xstart={props.newStartPosition.x}
      ystart={props.newStartPosition.y}
      xend={newEndPosition.x}
      yend={newEndPosition.y}
      isEventNode={props.lineNode.event !== undefined && props.lineNode.event !== ''}
      selectedNodeName={''}
      startNodeName={props.lineNode.startshapeid}
      endNodeName={props.lineNode.endshapeid}
      hasStartThumb={props.startshapeid === undefined || props.startshapeid === ''}
      hasEndThumb={props.endshapeid === undefined || props.endshapeid === ''}
      noMouseEvents={false}
      touchedNodes={props.touchedNodes}
      name={props.lineNode.name}
      thumbPosition={props.lineNode.thumbPosition || ThumbPositionRelativeToNode.default}
      thumbEndPosition={props.lineNode.thumbEndPosition || ThumbPositionRelativeToNode.default}
      onMouseConnectionStartOver={props.onMouseConnectionStartOver}
      onMouseConnectionStartOut={props.onMouseConnectionStartOut}
      onMouseConnectionStartStart={props.onMouseConnectionStartStart}
      onMouseConnectionStartMove={props.onMouseConnectionStartMove}
      onMouseConnectionStartEnd={props.onMouseConnectionStartEnd}
      onMouseConnectionEndOver={props.onMouseConnectionEndOver}
      onMouseConnectionEndOut={props.onMouseConnectionEndOut}
      onMouseConnectionEndStart={props.onMouseConnectionEndStart}
      onMouseConnectionEndMove={props.onMouseConnectionEndMove}
      onMouseConnectionEndEnd={props.onMouseConnectionEndEnd}
      onMouseConnectionEndLeave={props.onMouseConnectionEndLeave}
    ></Line>
  );
};

export interface ILinesProp {
  node: any;
  getNodeInstance: any;
  canvasHasSelectedNode: boolean;
  isSelected: boolean;
  selectedNode: any;
  shapeRefs;
  onLineMouseOver;
  onLineMouseOut;
  onClickLine;
  touchedNodes;
  onMouseStart: any;
  onMouseMove: any;
  onMouseEnd: any;

  useFlowStore: () => IFlowState;

  onMouseConnectionStartOver?: any;
  onMouseConnectionStartOut?: any;
  onMouseConnectionStartStart?: any;
  onMouseConnectionStartMove?: any;
  onMouseConnectionStartEnd?: any;

  onMouseConnectionEndOver?: any;
  onMouseConnectionEndOut?: any;
  onMouseConnectionEndStart?: any;
  onMouseConnectionEndMove?: any;
  onMouseConnectionEndEnd?: any;
  onMouseConnectionEndLeave?: any;
}

export const Lines = (props: ILinesProp) => {
  const flow = props.useFlowStore();
  const positionContext = usePositionContext();

  const lines = useMemo(() => {
    const item = flow.flowHashmap.get(props.node.name);
    if (!item || !item.start) {
      return [];
    }
    return item.start.map((lineIndex, index) => {
      return flow.flow[lineIndex];
    });
  }, [props.node.name, flow, flow.flowHashmap]);
  /*
	const lines = useMemo(() => {
		return props.flow.filter((lineNode, index) => {		
			if (lineNode.startshapeid == props.node.name && lineNode.shapeType === "Line") {
				return true;
			}
			return false;
			})}
		 , [props.node.name, props.flow]);
	*/
  return (
    <>
      {lines.map((lineNode, index) => {
        /*
				- lijnen vanuit de huidige node naar een andere node
			*/
        const item = flow.flowHashmap.get(lineNode.endshapeid);
        if (!item) {
          return false;
        }
        const endIndex = item.index;
        let endNode: any = undefined;
        if (endIndex >= 0) {
          endNode = flow.flow[endIndex];
        }

        let newPosition = { x: props.node.x, y: props.node.y };
        newPosition = (positionContext.getPosition(props.node.name) as any) || newPosition;

        let endPosition = { x: endNode?.x ?? lineNode.xend, y: endNode?.y ?? lineNode.yend };
        endPosition = (positionContext.getPosition(lineNode.endshapeid) as any) || endPosition;

        const newStartPosition = FlowToCanvas.getStartPointForLine(
          props.node,
          newPosition,
          endNode,
          endPosition,
          lineNode,
          props.getNodeInstance,
          (lineNode.thumbPosition as ThumbPositionRelativeToNode) || ThumbPositionRelativeToNode.default,
        );

        return (
          <React.Fragment key={index}>
            <LineHelper
              useFlowStore={props.useFlowStore}
              endshapeid={lineNode.endshapeid}
              startshapeid={lineNode.startshapeid}
              node={props.node}
              lineNode={lineNode}
              getNodeInstance={props.getNodeInstance}
              canvasHasSelectedNode={props.canvasHasSelectedNode}
              isSelected={props.isSelected}
              selectedNode={props.selectedNode}
              shapeRefs={props.shapeRefs}
              onLineMouseOver={props.onLineMouseOver}
              onLineMouseOut={props.onLineMouseOut}
              onClickLine={props.onClickLine}
              onMouseStart={props.onMouseStart}
              onMouseMove={props.onMouseMove}
              onMouseEnd={props.onMouseEnd}
              onMouseConnectionStartOver={props.onMouseConnectionStartOver}
              onMouseConnectionStartOut={props.onMouseConnectionStartOut}
              onMouseConnectionStartStart={props.onMouseConnectionStartStart}
              onMouseConnectionStartMove={props.onMouseConnectionStartMove}
              onMouseConnectionStartEnd={props.onMouseConnectionStartEnd}
              onMouseConnectionEndOver={props.onMouseConnectionEndOver}
              onMouseConnectionEndOut={props.onMouseConnectionEndOut}
              onMouseConnectionEndStart={props.onMouseConnectionEndStart}
              onMouseConnectionEndMove={props.onMouseConnectionEndMove}
              onMouseConnectionEndEnd={props.onMouseConnectionEndEnd}
              onMouseConnectionEndLeave={props.onMouseConnectionEndLeave}
              touchedNodes={props.touchedNodes}
              newStartPosition={newStartPosition}
            ></LineHelper>
          </React.Fragment>
        );
      })}
    </>
  );
};
