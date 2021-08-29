import * as React from 'react';
import { useImperativeHandle , useRef, useMemo} from 'react';

import { Group, Text, Ellipse as KonvaEllipse } from 'react-konva';
import { ShapeTypeProps, ModifyShapeEnum, ShapeStateEnum } from './shape-types';
import { ShapeMeasures } from '../../../helpers/shape-measures';
import { ShapeSettings } from '../../../helpers/shape-settings';
import { Lines } from './line-helper';

export const Ellipse = React.forwardRef((props: ShapeTypeProps, ref: any) => {
	const settings = useMemo(() => ShapeSettings.getShapeSettings(props.taskType, props.node),
		[props.taskType, props.node]);
	const groupRef = useRef(null as any);

	useImperativeHandle(ref, () => ({
		modifyShape: (action : ModifyShapeEnum, parameters : any) => {
			switch (+action) {
				case ModifyShapeEnum.GetShapeType : {
					return "ellipse";
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
					}
					break;
				}
				case ModifyShapeEnum.SetPoints : {
					break;
				}
				case ModifyShapeEnum.SetState : {
					/*
					if (groupRef && groupRef.current && parameters) {
						if (parameters.state == ShapeStateEnum.Touched) {
							groupRef.current.opacity(1);
						} else
						if (parameters.state == ShapeStateEnum.Default) {
							groupRef.current.opacity(0.5);
						}						
					}
					*/
					break;
				}
				default:
					break;
			}
		}
	}));

	return <>
		<Group
			x={props.x}
			y={props.y}
			ref={groupRef}
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
			transformsEnabled={"position"}
			opacity={props.canvasHasSelectedNode && !props.isSelected && !props.isConnectedToSelectedNode ? 1 : 1}
			>
			<KonvaEllipse 
				x={ShapeMeasures.rectWidht/2}
				y={ShapeMeasures.rectHeight/2}
				radiusX={100}
				radiusY={50}
				stroke={settings.strokeColor}
				strokeWidth={4}
				transformsEnabled={"position"}
				cornerRadius={settings.cornerRadius}
				width={ShapeMeasures.rectWidht}
				height={ShapeMeasures.rectHeight}
				fill={props.isSelected ? settings.fillSelectedColor : settings.fillColor}  
				perfectDrawEnabled={false}>
			</KonvaEllipse>
			<Text
				x={0}
				y={0}
				text={props.node && props.node.label ? props.node.label : props.name}
				align='center'
				width={ShapeMeasures.rectWidht}
				height={ShapeMeasures.rectHeight}
				verticalAlign="middle"
				transformsEnabled={"position"}
				listening={false}
				wrap="none"
				fontSize={18}
				ellipsis={true}
				fill={settings.textColor}
				perfectDrawEnabled={true}>
			</Text>
		</Group>		
	</>;
});