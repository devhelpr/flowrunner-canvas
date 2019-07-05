import * as React from 'react';

import * as Konva from 'react-konva';
const KonvaRect = Konva.Rect;

import { Group, Text } from 'react-konva';
import { ShapeTypeProps } from './shape-types';

export const Rect = (props: ShapeTypeProps) => {
	return <Group
		x={props.x}
		y={props.y}
	draggable={true}
		>
		<KonvaRect 
			x={0}
			y={0}
			stroke="#000000"
			strokeWidth={4}
			width={160}
			height={80}
			fill="#ff0000" 
			perfectDrawEnabled={false}>
		</KonvaRect>
		<Text
			x={0}
			y={0}
			text={props.name}
			align='center'
			width={160}
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