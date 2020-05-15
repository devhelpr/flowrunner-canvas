import * as React from 'react';
import { useState, useEffect, RefObject } from 'react';

import * as Konva from 'react-konva';
const KonvaRect = Konva.Rect;

import * as KonvaDirect from 'konva';
import { Group, Text } from 'react-konva';
import { ShapeTypeProps, shapeBackgroundColor, shapeSelectedBackgroundColor } from './shape-types';
import { ShapeMeasures } from '../../../helpers/shape-measures';
import { ShapeSettings } from '../../../helpers/shape-settings';

export const Html = (props: ShapeTypeProps) => {
	const settings = ShapeSettings.getShapeSettings(props.taskType, props.node);
	let rect : any = undefined;	
	
	const setRef = (ref) => {
		rect = ref;		
	}
	
	return <Group
		x={props.x}
		y={props.y}
		onDragMove={props.onDragMove}
		onDragEnd={props.onDragEnd}
		draggable={false}
		onClick={props.onClickShape}
		onTouchStart={props.onTouchStart}
		onTouchMove={props.onTouchMove}
		onTouchEnd={props.onTouchEnd}
		onMouseDown={props.onMouseStart}
		onMouseMove={props.onMouseMove}
		onMouseUp={props.onMouseEnd}
		onMouseOver={props.onMouseOver}
		onMouseOut={props.onMouseOut}				
		><KonvaRect
			ref={ref => (setRef(ref))}
			x={-((props.node.width || ShapeMeasures.htmlWidth)/2)}
			y={-((props.node.height || ShapeMeasures.htmlHeight)/2)}
			strokeWidth={0}
			cornerRadius={settings.cornerRadius}
			width={props.node.width || ShapeMeasures.htmlWidth}
			height={props.node.height || ShapeMeasures.htmlHeight}
			fill="#000000"
			opacity={0}  
			perfectDrawEnabled={false}></KonvaRect>		
	</Group>
}