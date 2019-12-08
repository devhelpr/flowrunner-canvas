import * as React from 'react';

import * as Konva from 'react-konva';
const KonvaEllipse = Konva.Ellipse;

import { Group, Text } from 'react-konva';
import { ShapeTypeProps, shapeBackgroundColor, shapeSelectedBackgroundColor } from './shape-types';
import { ShapeMeasures } from '../../../helpers/shape-measures';
import { ShapeSettings } from '../../../helpers/shape-settings';

export const Ellipse = (props: ShapeTypeProps) => {
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
		opacity={props.canvasHasSelectedNode && !props.isSelected ? 0.15 : 1}
		>
		<KonvaEllipse 
			x={ShapeMeasures.rectWidht/2}
			y={ShapeMeasures.rectHeight/2}
			radiusX={100}
			radiusY={50}
			stroke={settings.strokeColor}
			strokeWidth={4}
			cornerRadius={settings.cornerRadius}
			width={ShapeMeasures.rectWidht}
			height={ShapeMeasures.rectHeight}
			fill={props.isSelected ? settings.fillSelectedColor : settings.fillColor}  
			perfectDrawEnabled={false}>
		</KonvaEllipse>
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
			fill={settings.textColor}
			perfectDrawEnabled={true}>
		</Text>
	</Group>
}