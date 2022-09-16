import { INode } from '@devhelpr/flowrunner-canvas-core';
import * as React from 'react';
import { Diamond } from './diamond';
import { FormNode } from './form-node';

export const getNode = (
  node: INode,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
  width: number,
  height: number,
) => {
  if (node.shapeType === 'Diamond') {
    return <Diamond node={node} minX={minX} minY={minY} maxX={maxX} maxY={maxY} height={height} width={width} />;
  }
  if (node.taskType === 'FormTask') {
    return <FormNode node={node} minX={minX} minY={minY} maxX={maxX} maxY={maxY} height={height} width={width} />;
  }
  return (
    <>
      <rect
        x={node.x - minX}
        y={node.y - minY}
        width={width}
        height={height}
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
