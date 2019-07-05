import * as React from 'react';

import * as Konva from 'react-konva';
const KonvaCircle = Konva.Circle;

import { Group, Text } from 'react-konva';

import { ShapeTypeProps } from './shape-types';

export const Circle = (props : ShapeTypeProps) => {
	return <Group
		x={props.x}
		y={props.y}
	draggable={true}
		>
		<KonvaCircle 
			x={40}
			y={40}
			radius={32}
			stroke="#000000"
			strokeWidth={4}
			width={80}
			height={80}
			fill="#ff0000" 
			perfectDrawEnabled={false}>
		</KonvaCircle>
		<Text
			x={0}
			y={0}
			text={props.name}
			align='center'
			width={80}
			height={80}
			verticalAlign="middle"
			listening={false}
			wrap="none"
			ellipsis={true}
			fill='black' 
			perfectDrawEnabled={true}>
		</Text>
	</Group>
}