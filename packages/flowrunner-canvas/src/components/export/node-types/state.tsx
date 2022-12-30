import * as React from 'react';
import { getCurrentStateMachine, ShapeSettings } from '@devhelpr/flowrunner-canvas-core';
import { getColor } from '../utils/color';
import { INodeTypeProps } from './node-type-props';

export const State = (props: INodeTypeProps) => {
  const { node, minX, minY, width, height } = props;
  const settings = ShapeSettings.getShapeSettings(node.taskType, node) as unknown as any;
  const stateMachine = getCurrentStateMachine((node as any).stateMachine);
  let color: string = '#e2e2e2';
  console.log('stateMachine.currentState()', stateMachine.currentState());
  if ((node as any).StateName === stateMachine.currentState()) {
    color = '#86c6f8';
  }
  return (
    <>
      <rect
        x={node.x - minX}
        y={node.y - minY}
        width={width}
        height={height}
        style={{ fill: color || getColor(settings) || 'white', stroke: 'black', strokeWidth: 2 }}
        rx="15"
      />
      <text
        x={node.x - minX + width / 2}
        y={node.y - minY + height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fontFamily: 'arial, sans-serif', fontWeight: 500, fontSize: 18 }}
      >
        <tspan y={node.y - minY - 12.5 + height / 2} x={node.x - minX + width / 2} textAnchor="middle">
          {node.label || node.taskType}
        </tspan>
        <tspan y={node.y - minY + 12.5 + height / 2} x={node.x - minX + width / 2} textAnchor="middle">
          {(node as any).StateName}
        </tspan>
      </text>
    </>
  );
};
