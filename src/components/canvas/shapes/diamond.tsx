import * as React from 'react';

import * as Konva from 'react-konva';
const KonvaRect = Konva.Rect;

import { Group, Text, RegularPolygon } from 'react-konva';

import { ShapeTypeProps, shapeBackgroundColor, shapeSelectedBackgroundColor } from './shape-types';
import { ShapeMeasures } from '../../../helpers/shape-measures';
import { ShapeSettings } from '../../../helpers/shape-settings';

export const Diamond = (props: ShapeTypeProps) => {
	const settings = ShapeSettings.getShapeSettings(props.taskType, props.node);
	return <Group
		x={props.x}
		y={props.y}
		onDragMove={props.onDragMove}
		onDragEnd={props.onDragEnd}
		draggable={true}
		onClick={props.onClickShape}
		onMouseOver={props.onMouseOver}
		onMouseOut={props.onMouseOut}
		opacity={props.canvasHasSelectedNode && !props.isSelected && !props.isConnectedToSelectedNode ? 0.15 : 1}
		>
		<RegularPolygon 
			x={ShapeMeasures.circleSize/2}
			y={ShapeMeasures.circleSize/2}
			stroke={settings.strokeColor}
			strokeWidth={4}
			sides={4}
			radius={ShapeMeasures.circleSize}
			width={ShapeMeasures.circleSize}
			height={ShapeMeasures.circleSize}
			fill={props.isSelected ? settings.fillSelectedColor : settings.fillColor}  
			perfectDrawEnabled={false}>
		</RegularPolygon>
		<Text
			x={0}
			y={0}
			text={props.node && props.node.label ? props.node.label : props.name}
			align='center'
			width={ShapeMeasures.circleSize}
			height={ShapeMeasures.circleSize}
			verticalAlign="middle"
			listening={false}
			wrap="none"
			ellipsis={true}
			fill={settings.textColor}
			perfectDrawEnabled={true}>
		</Text>
	</Group>
}