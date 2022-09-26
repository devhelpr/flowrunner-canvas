import * as React from 'react';
import {
  calculateLineControlPoints,
  FlowToCanvas,
  IConnectionNode,
  IFlowrunnerConnector,
  INode,
  IPositionContextUtils,
  ThumbPositionRelativeToNode,
} from '@devhelpr/flowrunner-canvas-core';

export interface ILineNode {
  connectionNode: IConnectionNode;
  startNode: INode;
  endNode: INode;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  startWidth: number;
  startHeight: number;
  endWidth: number;
  endHeight: number;
  positionContext: IPositionContextUtils;
  getNodeInstance: (node: any, flowrunnerConnector?: IFlowrunnerConnector, flow?: any, taskSettings?: any) => any;
}

export const Line = (props: ILineNode) => {
  const {
    minX,
    minY,
    startWidth,
    startHeight,
    endWidth,
    endHeight,
    connectionNode,
    startNode,
    endNode,
    positionContext,
  } = props;

  let lineColor = 'black';
  if (connectionNode.followflow === 'onfailure') {
    lineColor = '#e00000';
  } else if (connectionNode.followflow === 'onsuccess') {
    lineColor = '#008300';
  }

  const startPositionNode = positionContext.getPosition(startNode.name) || startNode;
  const endPositionNode = positionContext.getPosition(endNode.name) || endNode;

  const startPosition = FlowToCanvas.getStartPointForLine(
    startNode,
    startPositionNode,
    endNode,
    endPositionNode,
    connectionNode,
    props.getNodeInstance,
    ((connectionNode as any).thumbPosition as ThumbPositionRelativeToNode) || ThumbPositionRelativeToNode.default,
  );

  const endPosition = FlowToCanvas.getEndPointForLine(
    endNode,
    endPositionNode,
    startNode,
    startPositionNode,
    props.getNodeInstance,
    ((connectionNode as any).thumbEndPosition as ThumbPositionRelativeToNode) || ThumbPositionRelativeToNode.default,
  );

  const controlPoints = calculateLineControlPoints(
    startPosition.x,
    startPosition.y,
    endPosition.x,
    endPosition.y,
    ((connectionNode as any).thumbPosition as ThumbPositionRelativeToNode) || ThumbPositionRelativeToNode.default,
    ((connectionNode as any).thumbEndPosition as ThumbPositionRelativeToNode) || ThumbPositionRelativeToNode.default,
    connectionNode,
  );

  // + startWidth / 2
  // + endWidth / 2
  // + startHeight / 2
  // + endHeight / 2

  /*
    <line
        x1={startPosition.x - minX}
        y1={startPosition.y - minY}
        x2={endPosition.x - minX}
        y2={endPosition.y - minY}
        stroke={lineColor}
      />
  */

  function interpolateCubicBezierAngle(startx, starty, control1x, control1y, control2x, control2y, endx, endy) {
    // 0 <= t <= 1
    return function interpolator(t) {
      const tangentX =
        3 * Math.pow(1 - t, 2) * (control1x - startx) +
        6 * (1 - t) * t * (control2x - control1x) +
        3 * Math.pow(t, 2) * (endx - control2x);
      const tangentY =
        3 * Math.pow(1 - t, 2) * (control1y - starty) +
        6 * (1 - t) * t * (control2y - control1y) +
        3 * Math.pow(t, 2) * (endy - control2y);

      return Math.atan2(tangentY, tangentX) * (180 / Math.PI);
    };
  }

  const getAngle = interpolateCubicBezierAngle(
    startPosition.x - minX,
    startPosition.y - minY,
    controlPoints.controlPointx1 - minX,
    controlPoints.controlPointy1 - minY,
    controlPoints.controlPointx2 - minX,
    controlPoints.controlPointy2 - minY,
    endPosition.x - minX,
    endPosition.y - minY,
  );

  return (
    <>
      <marker
        id={connectionNode.name + '_arrow'}
        markerWidth="10"
        markerHeight="10"
        refX="5"
        refY="5"
        orient={getAngle(1)}
      >
        <polygon points="0 0, 10 5, 0 10" />
      </marker>
      <path
        d={`M ${startPosition.x - minX} ${startPosition.y - minY} 
            C ${controlPoints.controlPointx1 - minX} ${controlPoints.controlPointy1 - minY},
              ${controlPoints.controlPointx2 - minX} ${controlPoints.controlPointy2 - minY}, 
              ${endPosition.x - minX} ${endPosition.y - minY}`}
        stroke={'#ffffff'}
        strokeWidth={8}
        fill="transparent"
      />
      <path
        markerEnd={`url(#${connectionNode.name}_arrow)`}
        d={`M ${startPosition.x - minX} ${startPosition.y - minY} 
            C ${controlPoints.controlPointx1 - minX} ${controlPoints.controlPointy1 - minY},
              ${controlPoints.controlPointx2 - minX} ${controlPoints.controlPointy2 - minY}, 
              ${endPosition.x - minX} ${endPosition.y - minY}`}
        stroke={lineColor}
        strokeWidth={2}
        fill="transparent"
      />
      {connectionNode.flowPath && (
        <>
          <rect
            x={(startPosition.x - minX + (endPosition.x - minX)) / 2 - connectionNode.flowPath.length * 18 * 0.5}
            y={(startPosition.y - minY + (endPosition.y - minY)) / 2 - 16}
            width={connectionNode.flowPath.length * 18}
            height={32}
            style={{ fill: 'white', stroke: 'black', strokeWidth: 2 }}
          />
          <text
            x={(startPosition.x - minX + (endPosition.x - minX)) / 2}
            y={(startPosition.y - minY + (endPosition.y - minY)) / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fontFamily: 'arial, sans-serif', fontWeight: 500, fontSize: 18 }}
          >
            {connectionNode.flowPath}
          </text>
        </>
      )}
    </>
  );
};
