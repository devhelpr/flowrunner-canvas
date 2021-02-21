import * as React from 'react';
import { useState, useEffect , useRef, useImperativeHandle} from 'react';

import * as Konva from 'react-konva';
import { calculateLineControlPoints } from '../../../helpers/line-points'

const KonvaLine = Konva.Arrow;

import { Group, Text } from 'react-konva';

import { LineTypeProps, ModifyShapeEnum, ShapeStateEnum , ThumbPositionRelativeToNode } from './shape-types';
export const Line = React.forwardRef((props : LineTypeProps, ref : any) => {

	
	const [fillColor, setFillColor] = useState("#000000");
	const [strokeWidth, setStrokeWidth] = useState(2);
	const [opacity, setOpacity] = useState(1);
	const [dash, setDash] = useState(props.touchedNodes && props.name && props.touchedNodes[props.name] ? [5,10] : [1,1]);
	const lineRef = useRef(null as any);

	useEffect(() => {
		let _fillColor = props.isSelected ? "#606060" : "#000000";	
		let _strokeWidth = 4;

		if (props.isErrorColor) {
			_fillColor = props.isSelected ? "#800000" : "#e00000";  
		}

		if (props.isSuccessColor) {
			_fillColor = props.isSelected ? "#008000" : "#00d300";  
		}

		if (props.isAltColor) {
			_fillColor = "#a0a0a0";  
			_strokeWidth = 2;
		}

		if (props.isConnectionWithVariable) {
			_fillColor = "#0080e0";  
			_strokeWidth = 2;
		}

		if (props.isEventNode) {
			_fillColor = "#a000a0";  
			_strokeWidth = 4;
		}

		let _opacity = 1;
		if (!props.isSelected && props.canvasHasSelectedNode) {
			if (props.selectedNodeName != props.startNodeName && 
				props.selectedNodeName != props.endNodeName) {
				_opacity = 0.15;
			}
		}

		let dash : any[] = [];
		if (props.touchedNodes && props.name && props.touchedNodes[props.name]) {
			dash = [5,10];
			_strokeWidth = 8;
			_opacity = 1;
		} else {
			_opacity = 0.5;
		}


		setFillColor(_fillColor);
		setStrokeWidth(_strokeWidth);
		setOpacity(_opacity);

		if (props.touchedNodes && props.name && props.touchedNodes[props.name]) {
			setDash([5,10]);
		} else {
			setDash([]);
		}
	},[props.isSelected, 
		props.isErrorColor,
		props.isSuccessColor,
		props.isAltColor,
		props.isConnectionWithVariable, 
		props.isEventNode,
		props.canvasHasSelectedNode,
		props.selectedNodeName,
		props.startNodeName,
		props.endNodeName,
		props.touchedNodes
	]);

	
	useImperativeHandle(ref, () => ({
		modifyShape: (action : ModifyShapeEnum, parameters : any) => {
			switch (+action) {
				case ModifyShapeEnum.GetShapeType : {
					return "line";
					break;
				}
				case ModifyShapeEnum.GetXY : {
					if (lineRef && lineRef.current) {
						return {
							x: (lineRef.current as any).x(),
							y: (lineRef.current as any).y(),
						}
						/*
						const x = group ? group.attrs["x"] : 0;
						const y = group ? group.attrs["y"] : 0;
						*/
					}
					break;
				}
				case ModifyShapeEnum.SetXY : {
					if (lineRef && lineRef.current && parameters) {
						lineRef.current.x(parameters.x);
						lineRef.current.y(parameters.y);
						
					}
					break;
				}
				case ModifyShapeEnum.SetOpacity : {
					if (lineRef && lineRef.current && parameters) {
						lineRef.current.opacity(parameters.opacity);						
					}
					break;
				}
				case ModifyShapeEnum.SetPoints : {
					if (lineRef && lineRef.current && parameters) {
						lineRef.current.points(parameters.points);						
					}
					break;
				}
				case ModifyShapeEnum.SetState : {
					if (lineRef && lineRef.current && parameters) {
						if (parameters.state == ShapeStateEnum.Touched) {
							lineRef.current.dash([5,10]);
							lineRef.current.strokeWidth(8);
							lineRef.current.opacity(1);
						} else
						if (parameters.state == ShapeStateEnum.Default) {
							lineRef.current.dash([]);
							lineRef.current.strokeWidth(4);
							lineRef.current.opacity(0.5);
						}						
					}
					break;
				}
				default:
					break;
			}
		}
	}));
	
	

	let controlPoints = calculateLineControlPoints(props.xstart, props.ystart, props.xend, props.yend,
		props.thumbPosition as ThumbPositionRelativeToNode || ThumbPositionRelativeToNode.default);
/*
	let fillColor = props.isSelected ? "#606060" : "#000000";	
	let strokeWidth = 4;

	if (props.isErrorColor) {
		fillColor = props.isSelected ? "#800000" : "#e00000";  
	}

	if (props.isSuccessColor) {
		fillColor = props.isSelected ? "#008000" : "#00d300";  
	}

	if (props.isAltColor) {
		fillColor = "#a0a0a0";  
		strokeWidth = 2;
	}

	if (props.isConnectionWithVariable) {
		fillColor = "#0080e0";  
		strokeWidth = 2;
	}

	if (props.isEventNode) {
		fillColor = "#a000a0";  
		strokeWidth = 4;
	}

	let opacity = 1;
	if (!props.isSelected && props.canvasHasSelectedNode) {
		if (props.selectedNodeName != props.startNodeName && 
			props.selectedNodeName != props.endNodeName) {
			opacity = 0.15;
		}
	}
*/
	return <Group listening={!props.noMouseEvents}>
		<KonvaLine
		 	ref={lineRef} 
			points={[props.xstart, props.ystart,
				controlPoints.controlPointx1, controlPoints.controlPointy1,
				controlPoints.controlPointx2, controlPoints.controlPointy2,
				props.xend, props.yend]}
			stroke={fillColor} 
			strokeWidth={strokeWidth}
			pointerLength={10}
			pointerWidth={10}
			lineCap="round"
			lineJoin="round"
			dash={dash}
			fill={fillColor} 
			opacity={props.opacity !== undefined ? props.opacity : opacity}
			tension={0}
			bezier={true}
			perfectDrawEnabled={false}
			onMouseOver={props.onMouseOver}
			onMouseOut={props.onMouseOut}
			onClick={props.onClickLine}
		>
		</KonvaLine>		
	</Group>
});