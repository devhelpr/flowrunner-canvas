import * as React from 'react';

import * as Konva from 'react-konva';
const KonvaRect = Konva.Rect;

import { Group, Text, RegularPolygon } from 'react-konva';

import { ShapeTypeProps, shapeBackgroundColor, shapeSelectedBackgroundColor } from './shape-types';
import { ShapeMeasures } from '../../../helpers/shape-measures';
import { ShapeSettings } from '../../../helpers/shape-settings';
import { replaceValuesExpressions } from '../../../helpers/replace-values';
export const Diamond = (props: ShapeTypeProps) => {
	const settings = ShapeSettings.getShapeSettings(props.taskType, props.node);

	let labelText = props.node && props.node.label ? props.node.label : props.name;
	if ((settings as any).label) {
		labelText= replaceValuesExpressions((settings as any).label, props.node, "-");
	}

	return <Group
		x={props.x}
		y={props.y}
		onDragMove={props.onDragMove}
		onDragEnd={props.onDragEnd}
		draggable={false}
		onClick={props.onClickShape}
		onMouseOver={props.onMouseOver}
		onMouseOut={props.onMouseOut}
		onTouchStart={props.onTouchStart}
		onTouchMove={props.onTouchMove}
		onTouchEnd={props.onTouchEnd}
		onMouseDown={props.onMouseStart}
		onMouseMove={props.onMouseMove}
		onMouseUp={props.onMouseEnd}
		onMouseLeave={props.onMouseLeave}
		opacity={props.canvasHasSelectedNode && !props.isSelected && !props.isConnectedToSelectedNode ? 0.15 : 1}
		>
		<RegularPolygon 
			x={ShapeMeasures.diamondSize/2}
			y={ShapeMeasures.diamondSize/2}
			stroke={settings.strokeColor}
			strokeWidth={4}
			sides={4}
			radius={ShapeMeasures.diamondSize}
			width={ShapeMeasures.diamondSize}
			height={ShapeMeasures.diamondSize}
			fill={props.isSelected ? settings.fillSelectedColor : settings.fillColor}  
			perfectDrawEnabled={false}>
		</RegularPolygon>
		<Text
			x={10}
			y={0}
			text={labelText}
			align='center'
			width={ShapeMeasures.diamondSize - 20}
			height={ShapeMeasures.diamondSize}
			verticalAlign="middle"
			listening={false}
			wrap="word"
			fontSize={18}
			ellipsis={true}
			fill={settings.textColor}
			perfectDrawEnabled={true}>
		</Text>
	</Group>
}