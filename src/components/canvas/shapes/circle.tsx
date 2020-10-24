import * as React from 'react';

import * as Konva from 'react-konva';
const KonvaCircle = Konva.Circle;

import { Group, Text } from 'react-konva';

import { ShapeTypeProps, shapeBackgroundColor, shapeSelectedBackgroundColor } from './shape-types';
import { ShapeMeasures } from '../../../helpers/shape-measures';
import { ShapeSettings } from '../../../helpers/shape-settings';

export const Circle = React.forwardRef((props : ShapeTypeProps, ref : any) => {
	const settings = ShapeSettings.getShapeSettings(props.taskType, props.node);
	return <Group
		x={props.x}
		y={props.y}
		ref={ref}
		data-id={props.name}
		draggable={false}
		onDragStart={props.onDragStart}
		onDragMove={props.onDragMove}
		onDragEnd={props.onDragEnd}
		onClick={props.onClickShape}
		onTouchStart={props.onTouchStart}
		onTouchMove={props.onTouchMove}
		onTouchEnd={props.onTouchEnd}
		onMouseDown={props.onMouseStart}
		onMouseMove={props.onMouseMove}
		onMouseUp={props.onMouseEnd}
		onMouseOver={props.onMouseOver}
		onMouseOut={props.onMouseOut}
		onMouseLeave={props.onMouseLeave}
		opacity={props.canvasHasSelectedNode && !props.isSelected && !props.isConnectedToSelectedNode ? 0.15 : 1}
		>
		<KonvaCircle 
			x={ShapeMeasures.circleSize/2}
			y={ShapeMeasures.circleSize/2}
			radius={ShapeMeasures.circleSize}
			stroke={settings.strokeColor}
			strokeWidth={4}
			width={ShapeMeasures.circleSize}
			height={ShapeMeasures.circleSize}
			fill={props.isSelected ? settings.fillSelectedColor : settings.fillColor} 
			perfectDrawEnabled={false}>
		</KonvaCircle>
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
			fontSize={18}
			ellipsis={true}
			fill={settings.textColor}
			perfectDrawEnabled={true}>
		</Text>
	</Group>
});