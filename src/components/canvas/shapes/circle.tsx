import * as React from 'react';

import * as Konva from 'react-konva';
const KonvaCircle = Konva.Circle;

import { Group, Text } from 'react-konva';

export const Circle = () => {
	return <Group
		x={500}
		y={500}
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
				text={"hello"}
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