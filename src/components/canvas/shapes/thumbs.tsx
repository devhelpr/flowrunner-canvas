import * as React from 'react';
import { useState, useEffect, useLayoutEffect } from 'react';

import * as Konva from 'react-konva';
const KonvaRect = Konva.Rect;
const KonvaRegularPolygon = Konva.RegularPolygon;
const KonvaCircle = Konva.Circle;

import { Group, Text } from 'react-konva';
import { ThumbTypeProps } from './shape-types';
import { ShapeMeasures } from '../../../helpers/shape-measures';
import { ShapeSettings } from '../../../helpers/shape-settings';

export const Thumbs = React.forwardRef((props: ThumbTypeProps, ref : any) => {

	const [width, setWidth] = useState(0);
	const [height, setHeight] = useState(0);
	
	useLayoutEffect(() => {
		if (props.getNodeInstance) {
			const instance = props.getNodeInstance(props.node, undefined, undefined, settings);
			if (instance && instance.getWidth && instance.getHeight) {
				setWidth(instance.getWidth(props.node));
				setHeight(instance.getHeight(props.node));
			}
		}
	}, [props.isSelected, props.isConnectedToSelectedNode, props.node]);
	
	const settings = ShapeSettings.getShapeSettings(props.taskType, props.node);
	let skewX = 0;
	let skewXOffset = 0;

	if (settings.isSkewed) {
		skewX = -0.5;
		skewXOffset = (ShapeMeasures.rectWidht/8) - 12;
	}

	/*
x={-((width || props.node.width || ShapeMeasures.htmlWidth)/2)}
			y={-((height || props.node.height || ShapeMeasures.htmlHeight)/2)}


			sides={3}
			rotation={90}
	*/
	return <><Group
		ref={ref}
		x={props.x + skewXOffset}
		y={props.y}
		onMouseOver={props.onMouseConnectionEndOver}
		onMouseOut={props.onMouseConnectionEndOut}
		onMouseDown={props.onMouseConnectionEndStart}
		onMouseMove={props.onMouseConnectionEndMove}
		onMouseUp={props.onMouseConnectionEndEnd}
		onMouseLeave={props.onMouseConnectionEndLeave}
		width={12}
		height={12}
	>
		{props.shapeType === "Rect" && <>			
			<KonvaCircle
				x={0}
				y={12}				
				radius={8}
				fill="#000000"				
				opacity={props.canvasHasSelectedNode && !props.isSelected && !props.isConnectedToSelectedNode ? 0.15 : 1}
			></KonvaCircle>
			<KonvaCircle
				x={0}
				y={12}				
				radius={6}
				fill="#ffffff"				
				opacity={props.canvasHasSelectedNode && !props.isSelected && !props.isConnectedToSelectedNode ? 0.15 : 1}
			></KonvaCircle>
			<KonvaCircle
				x={0}
				y={12}
				radius={12}
				opacity={0}
			></KonvaCircle>
		</>}
		{props.shapeType === "Html" && <>
			<KonvaRect
				x={-((width || props.node.width || ShapeMeasures.htmlWidth)/2) - 16}
				y={-((height || props.node.height || ShapeMeasures.htmlHeight)/2) + 36}
				strokeWidth={0}
				stroke="#808080"
				cornerRadius={settings.cornerRadius}
				width={24}
				height={24}
				fill="#ff0000"
				opacity={0}  
				perfectDrawEnabled={false}
				name={"connectiontionend"}
				listening={true}
				
				></KonvaRect>
			<KonvaCircle
				x={-((width || props.node.width || ShapeMeasures.htmlWidth)/2)}
				y={-((height || props.node.height || ShapeMeasures.htmlHeight)/2) + 52}
				radius={12}
				opacity={0}
			></KonvaCircle>					
		</>}			
	</Group>
	</>
})

/*
<KonvaRect
				x={-4}
				y={8}
				strokeWidth={2}
				stroke="#808080"
				cornerRadius={settings.cornerRadius}
				width={8}
				height={8}
				fill="#808080"
				opacity={1}  
				perfectDrawEnabled={false}
				name={"connectiontionend"}
				listening={true}
				
				></KonvaRect>	
			<KonvaRect
				x={-2 -4}
				y={- 2 + 8}
				strokeWidth={2}
				stroke="#e2e2e2"
				cornerRadius={settings.cornerRadius}
				width={12}
				height={12}					
				opacity={1}  
			perfectDrawEnabled={false}></KonvaRect>
*/