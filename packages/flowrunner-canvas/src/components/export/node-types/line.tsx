import * as React from 'react';
import { IConnectionNode, INode } from '@devhelpr/flowrunner-canvas-core';

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
}

export const Line = (props: ILineNode) => {
  const { minX, minY, startWidth, startHeight, endWidth, endHeight, connectionNode, startNode, endNode } = props;
  return (
    <>
      <line
        x1={startNode.x - minX + startWidth / 2}
        y1={startNode.y - minY + startHeight / 2}
        x2={endNode.x - minX + endWidth / 2}
        y2={endNode.y - minY + endHeight / 2}
        stroke="black"
      />
      {connectionNode.flowPath && (
        <>
          <rect
            x={
              (startNode.x - minX + startWidth / 2 + (endNode.x - minX + endWidth / 2)) / 2 -
              connectionNode.flowPath.length * 18 * 0.5
            }
            y={(startNode.y - minY + startHeight / 2 + (endNode.y - minY + endHeight / 2)) / 2 - 16}
            width={connectionNode.flowPath.length * 18}
            height={32}
            style={{ fill: 'white', stroke: 'black', strokeWidth: 2 }}
          />
          <text
            x={(startNode.x - minX + startWidth / 2 + (endNode.x - minX + endWidth / 2)) / 2}
            y={(startNode.y - minY + startHeight / 2 + (endNode.y - minY + endHeight / 2)) / 2}
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
