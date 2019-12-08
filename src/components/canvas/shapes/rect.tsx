import * as React from 'react';
import { useState, useEffect, RefObject } from 'react';

import * as Konva from 'react-konva';
import {KonvaNodeComponent} from 'react-konva';
const KonvaRect = Konva.Rect;

import { Group, Text } from 'react-konva';
import { ShapeTypeProps, shapeBackgroundColor, shapeSelectedBackgroundColor } from './shape-types';
import { ShapeMeasures } from '../../../helpers/shape-measures';
import { ShapeSettings } from '../../../helpers/shape-settings';

export const Rect = (props: ShapeTypeProps) => {
	const settings = ShapeSettings.getShapeSettings(props.taskType, props.node);
	let rect : any = undefined;	
	let skewX = 0;
	let skewXOffset = 0;

	if (settings.isSkewed) {
		skewX = -0.5;
		skewXOffset = (ShapeMeasures.rectWidht/8);
	}

	useEffect(() => {
		if (rect) {
			rect.skew({
				x: skewX,
				y: 0
			});
		}
	});

	const setRef = (ref) => {
		rect = ref;
		if (rect) {
			rect.skew({
				x: skewX,
				y: 0
			});
		}
	}

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
		<KonvaRect
			ref={ref => (setRef(ref))}
			x={skewXOffset}
			y={0}
			stroke={settings.strokeColor}
			strokeWidth={4}
			cornerRadius={settings.cornerRadius}
			width={ShapeMeasures.rectWidht}
			height={ShapeMeasures.rectHeight}
			fill={props.isSelected ? settings.fillSelectedColor : settings.fillColor}  
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
			fill={settings.textColor}
			perfectDrawEnabled={true}>
		</Text>
	</Group>
}