import { INode, ShapeSettings } from '@devhelpr/flowrunner-canvas-core';
import * as React from 'react';
import { getColor } from '../utils/color';
import { Actor } from './actor';
import { Diamond } from './diamond';
import { FormNode } from './form-node';
import { State } from './state';

export const getNode = (
  node: INode,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
  width: number,
  height: number,
) => {
  if (node.shapeType === 'Section') {
    return (
      <rect
        id={`${node.name}_section`}
        x={node.x - minX}
        y={node.y - minY}
        width={(node as any).width || width}
        height={(node as any).height || height}
        style={{ fill: 'transparent', stroke: 'black', strokeWidth: 2 }}
        rx="15"
      />
    );
  }
  if (node.shapeType === 'Diamond') {
    return <Diamond node={node} minX={minX} minY={minY} maxX={maxX} maxY={maxY} height={height} width={width} />;
  }
  if (node.shapeType === 'Actor') {
    return <Actor node={node} minX={minX} minY={minY} maxX={maxX} maxY={maxY} height={height} width={width} />;
  }
  if (node.shapeType === 'Text') {
    return (
      <text
        x={node.x - minX}
        y={node.y - minY + height / 2}
        textAnchor="left"
        dominantBaseline="middle"
        style={{ fontFamily: 'arial, sans-serif', fontWeight: 500, fontSize: (node as any).fontSize || 18 }}
      >
        {node.label || node.taskType}
      </text>
    );
  }
  if (node.taskType === 'State') {
    return <State node={node} minX={minX} minY={minY} maxX={maxX} maxY={maxY} height={height} width={width} />;
  }
  if (node.taskType === 'FormTask') {
    return <FormNode node={node} minX={minX} minY={minY} maxX={maxX} maxY={maxY} height={height} width={width} />;
  }
  const settings = ShapeSettings.getShapeSettings(node.taskType, node) as unknown as any;
  return (
    <>
      {settings.shapeHint === 'circle' ? (
        <circle
          cx={node.x - minX + width / 2}
          cy={node.y - minY + width / 2}
          r={width / 2}
          style={{ fill: getColor(settings) || 'white', stroke: 'black', strokeWidth: 2 }}
        />
      ) : (
        <rect
          x={node.x - minX}
          y={node.y - minY}
          width={width}
          height={height}
          style={{ fill: getColor(settings) || 'white', stroke: 'black', strokeWidth: 2 }}
          rx="15"
        />
      )}
      <text
        x={node.x - minX + width / 2}
        y={settings.shapeHint === 'circle' ? node.y - minY - height / 4 : node.y - minY + height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fontFamily: 'arial, sans-serif', fontWeight: 500, fontSize: 18 }}
      >
        {node.label || node.taskType}
      </text>
    </>
  );
};
