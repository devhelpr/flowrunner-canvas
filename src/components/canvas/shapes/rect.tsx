import * as React from 'react';
import { useState, useEffect, RefObject } from 'react';

import * as Konva from 'react-konva';
const KonvaRect = Konva.Rect;
const KonvaImage = Konva.Image;
const KonvaLine = Konva.Line;

import useImage from 'use-image';
import { Group, Text } from 'react-konva';
import { ShapeTypeProps, shapeBackgroundColor, shapeSelectedBackgroundColor } from './shape-types';
import { ShapeMeasures } from '../../../helpers/shape-measures';
import { ShapeSettings } from '../../../helpers/shape-settings';

export const Rect = (props: ShapeTypeProps) => {
	const settings = ShapeSettings.getShapeSettings(props.taskType, props.node);
	let rect : any = undefined;	
	let skewX = 0;
	let skewXOffset = 0;
	let includeSvgIcon = false;
	const [image] = useImage("/svg/layout.svg");

	if (settings.isSkewed) {
		skewX = -0.5;
		skewXOffset = (ShapeMeasures.rectWidht/8);
	}

	if (props.node && props.node.objectSchema) {
		if (props.node.objectSchema == "layout") {
			includeSvgIcon = true;			
		}
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
		onTouchStart={props.onTouchStart}
		onTouchMove={props.onTouchMove}
		onTouchEnd={props.onTouchEnd}
		onDragStart={props.onDragStart}
		onDragMove={props.onDragMove}
		onDragEnd={props.onDragEnd}
		draggable={false}
		onClick={props.onClickShape}
		onMouseOver={props.onMouseOver}
		onMouseOut={props.onMouseOut}
		onMouseDown={props.onMouseStart}
		onMouseMove={props.onMouseMove}
		onMouseUp={props.onMouseEnd}
		onMouseLeave={props.onMouseLeave}		
		opacity={props.canvasHasSelectedNode && !props.isSelected && !props.isConnectedToSelectedNode ? 0.15 : 1}
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
		{settings.subShapeType && settings.subShapeType == "Model" && <KonvaLine
			points={[skewXOffset,10,(skewXOffset+ShapeMeasures.rectWidht),10]}
			stroke={settings.strokeColor} 
			strokeWidth={4}
		></KonvaLine>}
		{includeSvgIcon && <KonvaImage image={image}
			pathColor={settings.textColor} 		
			width={Math.round(ShapeMeasures.rectWidht / 4)}
			height={Math.round(ShapeMeasures.rectWidht / 4)}			
			keepRatio={true}
			x={Math.round((ShapeMeasures.rectWidht / 2) - (ShapeMeasures.rectWidht / 8))}
			y={8} 
		/>}
		<Text
			x={0}
			y={includeSvgIcon ? Math.round(ShapeMeasures.rectWidht / 8) : 0}
			text={props.node && props.node.label ? props.node.label : props.name}
			align='center'
			fontSize={18}
			width={ShapeMeasures.rectWidht}
			height={ShapeMeasures.rectHeight}
			verticalAlign="middle"
			listening={false}
			wrap="none"
			ellipsis={true}
			fill={settings.textColor}
			perfectDrawEnabled={true}>
		</Text>
		{settings.events && settings.events.map((event ,index) => {
			return <React.Fragment key={index}>
				<KonvaRect
					x={ShapeMeasures.rectWidht + 10 - 14}
					y={index * 10 + 8}
					strokeWidth={2}
					stroke="#a000a0"
					cornerRadius={settings.cornerRadius}
					width={8}
					height={8}
					fill="#ffffff"
					title={event.eventName}
					opacity={1}  
					perfectDrawEnabled={false}></KonvaRect>	
				<KonvaRect
					x={ShapeMeasures.rectWidht + 10 - 2 - 14}
					y={index * 10 - 2 + 8}
					strokeWidth={2}
					stroke="#e2e2e2"
					cornerRadius={settings.cornerRadius}
					width={12}
					height={12}					
					title={event.eventName}
					opacity={1}  
					perfectDrawEnabled={false}></KonvaRect>					
			</React.Fragment>
		})}		
	</Group>
}