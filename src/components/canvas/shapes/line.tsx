import * as React from 'react';

import * as Konva from 'react-konva';
import Victor from "victor";

const KonvaLine = Konva.Arrow;

import { Group, Text } from 'react-konva';

import { LineTypeProps } from './shape-types';
export const Line = (props : LineTypeProps) => {

	let controlPointx1;
	let controlPointy1;
	let controlPointx2;
	let controlPointy2;

	//let diffAbsX = Math.abs(props.xstart - props.xend);
	let factor = 0.75;
	/*
	if (props.xstart < props.xend) {
		controlPointx1 = props.xstart+(factor*diffAbsX);
		controlPointy1 = props.ystart; 
		controlPointx2 = props.xend-(factor*diffAbsX);
		controlPointy2 = props.yend; 
	} else {
		controlPointx1 = props.xstart-(factor*diffAbsX);
		controlPointy1 = props.ystart; 
		controlPointx2 = props.xend+(factor*diffAbsX);
		controlPointy2 = props.yend; 
	}
	*/

	var vec1 = new Victor(props.xstart, props.ystart);
	var vec2 = new Victor(props.xend, props.yend);
	
	var distance = vec1.distance(vec2) * factor;

	/*if (this.props.shape.outputSnap == "bottom") {
		controlPointx1 = xStart;
		controlPointy1 = yStart+(distance); 
	} else*/ {
		controlPointx1 = props.xstart + (distance);
		controlPointy1 = props.ystart; 
	}
	
	/*if (this.props.shape.inputSnap == "top") {
		controlPointx2 = xEnd;
		controlPointy2 = yEnd-(distance); 
	} else */ {
		controlPointx2 = props.xend-(distance);
		controlPointy2 = props.yend; 
	}
	
	let fillColor = props.isSelected ? "#606060" : "#000000";	
	let strokeWidth = 4;

	if (props.isAltColor) {
		fillColor = "#a0a0a0";  
		strokeWidth = 2;
	}


	return <Group>
		<KonvaLine 
			points={[props.xstart, props.ystart,
				controlPointx1, controlPointy1,
				controlPointx2, controlPointy2,
				props.xend, props.yend]}
			stroke={fillColor} 
			strokeWidth={strokeWidth}
			pointerLength={10}
			pointerWidth={10}
			lineCap="round"
			lineJoin="round"
			fill={fillColor} 
			tension={0}
			bezier={true}
			perfectDrawEnabled={false}
			onMouseOver={props.onMouseOver}
			onMouseOut={props.onMouseOut}
			onClick={props.onClickLine}
		>
		</KonvaLine>		
	</Group>
}