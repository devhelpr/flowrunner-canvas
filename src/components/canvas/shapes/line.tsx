import * as React from 'react';
import { useState, useEffect} from 'react';

import * as Konva from 'react-konva';
import { calculateLineControlPoints } from '../../../helpers/line-points'

const KonvaLine = Konva.Arrow;

import { Group, Text } from 'react-konva';

import { LineTypeProps } from './shape-types';
export const Line = React.forwardRef((props : LineTypeProps, ref : any) => {

	
	const [fillColor, setFillColor] = useState("#000000");
	const [strokeWidth, setStrokeWidth] = useState(2);
	const [opacity, setOpacity] = useState(1);

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

		setFillColor(_fillColor);
		setStrokeWidth(_strokeWidth);
		setOpacity(_opacity);
	},[props.isSelected, 
		props.isErrorColor,
		props.isSuccessColor,
		props.isAltColor,
		props.isConnectionWithVariable, 
		props.isEventNode,
		props.canvasHasSelectedNode,
		props.selectedNodeName,
		props.startNodeName,
		props.endNodeName])
	

	let controlPoints = calculateLineControlPoints(props.xstart, props.ystart, props.xend, props.yend);
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
		 	ref={ref} 
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