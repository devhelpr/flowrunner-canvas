import { INode } from '@devhelpr/flowrunner-canvas-core';
import * as React from 'react';
import { INodeTypeProps } from './node-type-props';

export const Diamond = (props: INodeTypeProps) => {
  const { node, minX, minY, width, height } = props;
  return (
    <>
      <polygon
        points={`
            ${node.x - minX + width / 2}, ${node.y - minY}
            ${node.x - minX + width}, ${node.y - minY + height / 2}
            ${node.x - minX + width / 2}, ${node.y - minY + height} 
            ${node.x - minX}, ${node.y - minY + height / 2}
            `}
        style={{ fill: 'white', stroke: 'black', strokeWidth: 2 }}
      />
      <text
        x={node.x - minX + width / 2}
        y={node.y - minY + height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fontFamily: 'arial, sans-serif', fontWeight: 500, fontSize: 18 }}
      >
        {node.label || node.taskType}
      </text>
    </>
  );
};
