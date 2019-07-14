import * as React from 'react';

import * as Konva from 'react-konva';
const KonvaRect = Konva.Rect;

import { Group, Text } from 'react-konva';
import { ShapeTypeProps } from './shape-types';
import { ShapeMeasures } from '../../../helpers/shape-measures';

export const Rect = (props: ShapeTypeProps) => {
	return <Group
		x={props.x}
		y={props.y}
		onDragMove={props.onDragMove}
		onDragEnd={props.onDragEnd}
		draggable={true}
		onClick={props.onClickShape}
		>
		<KonvaRect 
			x={0}
			y={0}
			stroke="#000000"
			strokeWidth={4}
			width={ShapeMeasures.rectWidht}
			height={ShapeMeasures.rectHeight}
			fill="#ff0000" 
			perfectDrawEnabled={false}>
		</KonvaRect>
		<Text
			x={0}
			y={0}
			text={props.name}
			align='center'
			width={ShapeMeasures.rectWidht}
			height={ShapeMeasures.rectHeight}
			verticalAlign="middle"
			listening={false}
			wrap="none"
			ellipsis={true}
			fill='black' 
			perfectDrawEnabled={true}>
		</Text>
	</Group>
}