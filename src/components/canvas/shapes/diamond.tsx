import * as React from 'react';

import * as Konva from 'react-konva';
const KonvaRect = Konva.Rect;

import { Group, Text, RegularPolygon } from 'react-konva';

import { ShapeTypeProps, shapeBackgroundColor, shapeSelectedBackgroundColor } from './shape-types';
import { ShapeMeasures } from '../../../helpers/shape-measures';

export const Diamond = (props: ShapeTypeProps) => {
	return <Group
		x={props.x}
		y={props.y}
		onDragMove={props.onDragMove}
		onDragEnd={props.onDragEnd}
		draggable={true}
		onClick={props.onClickShape}
		onMouseOver={props.onMouseOver}
		onMouseOut={props.onMouseOut}
		>
		<RegularPolygon 
			x={ShapeMeasures.circleSize/2}
			y={ShapeMeasures.circleSize/2}
			stroke="#000000"
			strokeWidth={4}
			sides={4}
			radius={ShapeMeasures.circleSize}
			width={ShapeMeasures.circleSize}
			height={ShapeMeasures.circleSize}
			fill={props.isSelected ? shapeSelectedBackgroundColor : shapeBackgroundColor}  
			perfectDrawEnabled={false}>
		</RegularPolygon>
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