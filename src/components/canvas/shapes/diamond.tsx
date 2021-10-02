import * as React from 'react';
import { useImperativeHandle , useRef, useMemo} from 'react';

import { Group, Text, RegularPolygon, Image as KonvaImage } from 'react-konva';

import { ShapeTypeProps, ModifyShapeEnum, ShapeStateEnum } from './shape-types';
import { ShapeMeasures } from '../../../helpers/shape-measures';
import { ShapeSettings } from '../../../helpers/shape-settings';
import { replaceValuesExpressions } from '../../../helpers/replace-values';
import { Lines } from './line-helper';

import useImage from 'use-image';

export const Diamond = React.forwardRef((props: ShapeTypeProps , ref: any) => {
	const [image] = useImage("/svg/cog.svg");
	const groupRef = useRef(null as any);
	const regularPolygonRef = useRef(null as any);

	const settings = useMemo(() => ShapeSettings.getShapeSettings(props.taskType, props.node),
		[props.taskType, props.node]);

	useImperativeHandle(ref, () => ({
		modifyShape: (action : ModifyShapeEnum, parameters : any) => {
			switch (+action) {
				case ModifyShapeEnum.GetShapeType : {
					return "diamond";
					break;
				}
				case ModifyShapeEnum.GetXY : {
					if (groupRef && groupRef.current) {
						return {
							x: (groupRef.current as any).x(),
							y: (groupRef.current as any).y(),
						}
					}
					break;
				}
				case ModifyShapeEnum.SetXY : {
					if (groupRef && groupRef.current && parameters) {
						groupRef.current.x(parameters.x);
						groupRef.current.y(parameters.y);
					}
					break;
				}
				case ModifyShapeEnum.SetOpacity : {
					if (groupRef && groupRef.current && parameters) {
						groupRef.current.opacity(parameters.opacity);
						regularPolygonRef.current.to({
							duration: 0.05,
							opacity:parameters.opacity
						});					
					}
					break;
				}
				case ModifyShapeEnum.SetPoints : {
					break;
				}
				case ModifyShapeEnum.SetState : {
					if (regularPolygonRef && regularPolygonRef.current && parameters) {
						if (parameters.state == ShapeStateEnum.Selected) {
							regularPolygonRef.current.to({
								duration: 0.15,
								stroke:settings.strokeColor,
								fill:settings.fillSelectedColor
							});
						} else
						if (parameters.state == ShapeStateEnum.Default) {
							//regularPolygonRef.current.stroke(settings.strokeColor);
							//regularPolygonRef.current.fill(settings.fillColor);
							regularPolygonRef.current.to({
								duration: 0.15,
								stroke:settings.strokeColor,
								fill:settings.fillColor
							});
						} else
						if (parameters.state == ShapeStateEnum.Error) {
							//regularPolygonRef.current.stroke("#f00000");
							//regularPolygonRef.current.fill("#ff9d9d");
							regularPolygonRef.current.to({
								duration: 0.15,
								stroke:"#f00000",
								fill:"#ff9d9d"
							});
						} else
						if (parameters.state == ShapeStateEnum.Ok) {
							//regularPolygonRef.current.stroke("#00e000");
							//regularPolygonRef.current.fill("#9dff9d");
							regularPolygonRef.current.to({
								duration: 0.15,
								stroke:"#00e000",
								fill:"#9dff9d"
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

	let labelText = props.node && props.node.label ? props.node.label : props.name;
	if ((settings as any).label) {
		labelText= replaceValuesExpressions((settings as any).label, props.node, "-");
	}

	let textDecoration = "";

	let strokeColor = settings.strokeColor;
	let fillColor = props.isSelected ? settings.fillSelectedColor : settings.fillColor;
	if (props.nodeState === "error") {
		strokeColor = props.isSelected ? "#f00000" : "#e00000";
		fillColor = props.isSelected ? "#ff5454" : "#ff9d9d";
		//textDecoration = "line-through"
	} else 
	if (props.nodeState === "ok") {
		strokeColor = props.isSelected ? "#00f000" : "#00e000";
		fillColor = props.isSelected ? "#54ff54" : "#9dff9d";
	}
	
	return <>
		<Group
			x={props.x}
			y={props.y}
			ref={groupRef}
			onDragMove={props.onDragMove}
			onDragEnd={props.onDragEnd}
			draggable={false}
			transformsEnabled={"position"}
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
			opacity={props.canvasHasSelectedNode && !props.isSelected && !props.isConnectedToSelectedNode ? 1 : 1}
			>
			<RegularPolygon 
				x={ShapeMeasures.diamondSize/2}
				y={ShapeMeasures.diamondSize/2}
				stroke={strokeColor}
				strokeWidth={4}
				cornerRadius={4}
				sides={4}
				transformsEnabled={"position"}
				ref={regularPolygonRef}
				radius={ShapeMeasures.diamondSize}
				width={ShapeMeasures.diamondSize}
				height={ShapeMeasures.diamondSize}
				fill={fillColor}  
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
				transformsEnabled={"position"}
				textDecoration={textDecoration}
				fontSize={18}
				ellipsis={true}
				fill={settings.textColor}
				perfectDrawEnabled={false}>
			</Text>
			{!!settings.hasConfigMenu && <KonvaImage image={image}
				pathColor={settings.textColor} 		
				width={Math.round(ShapeMeasures.diamondSize / 8)}
				height={Math.round(ShapeMeasures.diamondSize / 8)}			
				keepRatio={true}
				x={Math.round((ShapeMeasures.diamondSize / 2) - ShapeMeasures.diamondSize / 16)}
				y={16}
				perfectDrawEnabled={false}
				transformsEnabled={"position"}
				onClick={props.onClickSetup} 
			/>}
		</Group>
		
	</>
});