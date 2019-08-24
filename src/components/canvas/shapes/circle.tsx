import * as React from 'react';

import * as Konva from 'react-konva';
const KonvaCircle = Konva.Circle;

import { Group, Text } from 'react-konva';

import { ShapeTypeProps, shapeBackgroundColor, shapeSelectedBackgroundColor } from './shape-types';
import { ShapeMeasures } from '../../../helpers/shape-measures';

export const Circle = (props : ShapeTypeProps) => {
	return <Group
		x={props.x}
		y={props.y}
		data-id={props.name}
		draggable={true}
		onDragMove={props.onDragMove}
		onDragEnd={props.onDragEnd}
		onClick={props.onClickShape}
		onMouseOver={props.onMouseOver}
		onMouseOut={props.onMouseOut}
		>
		<KonvaCircle 
			x={ShapeMeasures.circleSize/2}
			y={ShapeMeasures.circleSize/2}
			radius={ShapeMeasures.circleSize}
			stroke="#000000"
			strokeWidth={4}
			width={ShapeMeasures.circleSize}
			height={ShapeMeasures.circleSize}
			fill={props.isSelected ? shapeSelectedBackgroundColor : shapeBackgroundColor} 
			perfectDrawEnabled={false}>
		</KonvaCircle>
		<Text
			x={0}
			y={0}
			text={props.name}
			align='center'
			width={ShapeMeasures.circleSize}
			height={ShapeMeasures.circleSize}
			verticalAlign="middle"
			listening={false}
			wrap="none"
			ellipsis={true}
			fill='black' 
			perfectDrawEnabled={true}>
		</Text>
	</Group>
}