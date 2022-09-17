import * as React from 'react';
import { INodeTypeProps } from './node-type-props';

export const Actor = (props: INodeTypeProps) => {
  const x = props.node.x - props.minX;
  const y = props.node.y - props.minY;

  return (
    <g id={`Actor${props.node.name}`} stroke={'#000000'} strokeWidth={2} fill="transparent">
      <circle cx={52 + x} cy={52 + y} r="50" />
      <line x1={52 + x} y1={100 + y} x2={52 + x} y2={200 + y} />
      <line x1={2 + x} y1={150 + y} x2={102 + x} y2={150 + y} />
      <line x1={52 + x} y1={200 + y} x2={2 + x} y2={250 + y} />
      <line x1={52 + x} y1={200 + y} x2={102 + x} y2={250 + y} />
    </g>
  );
};
