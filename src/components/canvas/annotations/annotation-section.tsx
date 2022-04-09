import * as React from 'react';
import { useImperativeHandle , useRef } from 'react';

import { Group, Text, Rect as KonvaRect, Image as KonvaImage, Line as KonvaLine } from 'react-konva';
import { ModifyShapeEnum, ShapeStateEnum } from '../shapes/shape-types';

const getStrokeColor = (backgroundColorString, settings) => {
	switch (backgroundColorString)  {
		case "background-yellow": {
			return "#f0e938";
		}
		case "background-orange": {
			return "#f8a523";
		}
		case "background-blue": {
			return "#36a4f9";
		}
		case "background-green": {
			return "#3bee76";
		}
		case "background-purple": {
			return "#cc8aee";
		}
		default: {
			return settings.strokeColor;
		}
	}
}

const getFillColor = (backgroundColorString, settings) => {
	switch (backgroundColorString)  {
		case "background-yellow": {
			return "#fbf791";
		}
		case "background-orange": {
			return "#f4c67d";
		}
		case "background-blue": {
			return "#86c6f8";
		}
		case "background-green": {
			return "#7df4a4";
		}
		case "background-purple": {
			return "#e2bcf5";
		}
		default: {
			return settings.fillColor;
		}
	}
}

export interface IAnnotationSectionProps {
	x: number;
	y: number;
	width: number;
	height: number;
	name: string;
	onClick : any;
	onTouchStart: any;
	onMouseStart: any;
	onMouseMove: any;
	onMouseEnd: any;
	onMouseLeave: any;

	onMouseOver: any;
	onMouseOut: any;

	onDragStart: any;
	onDragMove: any;
	onDragEnd: any;
}

export const AnnotationSection = React.forwardRef((props: IAnnotationSectionProps, ref : any) => {

	let rect : any = useRef(null as any);
	
	const setRef = (ref) => {
		rect.current = ref;
	}	
	
	useImperativeHandle(ref, () => ({
		getGroupRef: () => {
			return rect.current;
		},
		modifyShape: (action : ModifyShapeEnum, parameters : any) => {
			switch (+action) {
				case ModifyShapeEnum.GetShapeType : {
					return "section";
					break;
				}
				case ModifyShapeEnum.GetXY : {
					if (rect && rect.current) {
						return {
							x: (rect.current as any).x(),
							y: (rect.current as any).y(),
						}
					}
					break;
				}
				case ModifyShapeEnum.SetXY : {
					if (rect && rect.current && parameters) {
						rect.current.x(parameters.x);
						rect.current.y(parameters.y);
					}
					break;
				}
				case ModifyShapeEnum.SetOpacity : {
					if (rect && rect.current && parameters) {
						rect.current.opacity(parameters.opacity);						
					}
					break;
				}
				case ModifyShapeEnum.SetPoints : {
					break;
				}
				case ModifyShapeEnum.SetState : {
					if (rect && rect.current && parameters) {
						if (parameters.state == ShapeStateEnum.Selected) {
							rect.current.to({
								duration: 0.15,
								stroke: "#808080",
								dash:[8,4]							
							});
						} else
						if (parameters.state == ShapeStateEnum.Default) {
							let strokeColor = "#000000";

							rect.current.to({
								duration: 0.15,
								stroke:strokeColor,
								dash:[0,0]
							});
						}
					}

					break;
				}
				default:
					break;
			}
		}
	}));

	let strokeColor = "#000000";
	
	//ref={ref} (group)
	return <KonvaRect
		ref={ref => (setRef(ref))}
		draggable={false}
		transformsEnabled={"position"}
		dash={[0,0]}
		x={props.x}
		y={props.y}
		stroke={strokeColor}
		
		hitStrokeWidth={0}			
		strokeWidth={4}
		listening={true}
		cornerRadius={5}
		width={props.width}
		height={props.height}
		onClick={props.onClick}
		perfectDrawEnabled={false}
		onMouseOver={props.onMouseOver}
		onMouseOut={props.onMouseOut}
		onTouchStart={props.onTouchStart}
		onTouchEnd={props.onMouseEnd}
		onTouchMove={props.onMouseMove}
		onMouseDown={props.onMouseStart}
		onMouseMove={props.onMouseMove}
		onMouseEnd={props.onMouseEnd}
		onMouseLeave={props.onMouseLeave}
		onDragStart={props.onDragStart}
		onDragMove={props.onDragMove}
		onDragEnd={props.onDragEnd}
		>				
	</KonvaRect>;		
});

/*

{settings.events && settings.events.map((event ,index) => {
				return <React.Fragment key={index}>
					<KonvaRect
						x={ShapeMeasures.rectWidht + 10 - 14}
						y={(index + 1) * 12 + 8}
						strokeWidth={2}
						stroke="#a000a0"
						cornerRadius={settings.cornerRadius}
						width={8}
						height={8}
						fill="#a000a0"
						title={event.eventName}
						opacity={1}  
						perfectDrawEnabled={false}></KonvaRect>	
					<KonvaRect
						x={ShapeMeasures.rectWidht + 10 - 2 - 14}
						y={(index + 1) * 12 - 2 + 8}
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
			
<Group
		x={props.x}
		y={props.y}
		onMouseOver={props.onMouseConnectionEndOver}
			onMouseOut={props.onMouseConnectionEndOut}
			onMouseDown={props.onMouseConnectionEndStart}
			onMouseMove={props.onMouseConnectionEndMove}
			onMouseUp={props.onMouseConnectionEndEnd}
	>
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

	</Group>
	<Group
		x={props.x}
		y={props.y}
		onMouseOver={props.onMouseConnectionStartOver}
		onMouseOut={props.onMouseConnectionStartOut}
		onMouseDown={props.onMouseConnectionStartStart}
		onMouseMove={props.onMouseConnectionStartMove}
		onMouseUp={props.onMouseConnectionStartEnd}
	>			
		<KonvaRect
			x={ShapeMeasures.rectWidht + 10 - 14}
			y={8}
			strokeWidth={2}
			stroke="#808080"
			cornerRadius={settings.cornerRadius}
			width={8}
			height={8}
			fill="#808080"
			opacity={1}
			order={1}  
			perfectDrawEnabled={false}
			listening={true}
			name={"connectiontionstart"}
			
			></KonvaRect>	
		<KonvaRect
			x={ShapeMeasures.rectWidht + 10 - 2 - 14}
			y={- 2 + 8}
			strokeWidth={2}
			stroke="#e2e2e2"
			cornerRadius={settings.cornerRadius}
			width={12}
			height={12}					
			opacity={1}  
			perfectDrawEnabled={false}></KonvaRect>	
	</Group>*/