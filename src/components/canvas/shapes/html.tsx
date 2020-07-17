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

	const [width, setWidth] = useState(0);
	const [height, setHeight] = useState(0);

	const settings = ShapeSettings.getShapeSettings(props.taskType, props.node);
	let rect : any = undefined;	
	
	const setRef = (ref) => {
		rect = ref;		
	}

	useEffect(() => {
		if (props.getNodeInstance) {
			const instance = props.getNodeInstance(props.node, undefined, undefined, undefined);
			if (instance && instance.getWidth && instance.getHeight) {
				console.log("instance.getWidth()", instance.getWidth(), instance);
				setWidth(instance.getWidth(props.node));
				setHeight(instance.getHeight(props.node));
			}
		}
	}, []);
	
	
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
			x={-((width || props.node.width || ShapeMeasures.htmlWidth)/2)}
			y={-((height || props.node.height || ShapeMeasures.htmlHeight)/2)}
			strokeWidth={0}
			cornerRadius={settings.cornerRadius}
			width={width || props.node.width || ShapeMeasures.htmlWidth}
			height={height || props.node.height || ShapeMeasures.htmlHeight}
			fill="#000000"
			opacity={0}  
			perfectDrawEnabled={false}></KonvaRect>
		{settings.events && settings.events.map((event ,index) => {
			return <React.Fragment key={index}>
				<KonvaRect
					x={(((width || props.node.width || ShapeMeasures.htmlWidth)/2) + 10)}
					y={-((height || props.node.height || ShapeMeasures.htmlHeight)/2) + (index * 10) + 32}
					strokeWidth={2}
					stroke="#000000"
					cornerRadius={settings.cornerRadius}
					width={8}
					height={8}
					fill="#e2e2e2"
					title={event.eventName}
					opacity={1}  
					perfectDrawEnabled={false}></KonvaRect>				
			</React.Fragment>
		})}		
	</Group>
}

/*

<Text x={(((width || props.node.width || ShapeMeasures.htmlWidth)/2) + 10) + 12}
					y={-((height || props.node.height || ShapeMeasures.htmlHeight)/2) + (index * 10) + 28}
					text={event.eventName}
					align='left'
					fontSize={12}
					lineHeight={20}
					height={20}
					verticalAlign="middle"
					listening={false}
					wrap="none"
					ellipsis={true}
					fill="#000000"
					perfectDrawEnabled={true}></Text>

*/