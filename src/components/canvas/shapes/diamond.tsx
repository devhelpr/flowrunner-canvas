import * as React from 'react';

import { Group, Text, RegularPolygon, Rect as KonvaRect } from 'react-konva';

import { ShapeTypeProps } from './shape-types';
import { ShapeMeasures } from '../../../helpers/shape-measures';
import { ShapeSettings } from '../../../helpers/shape-settings';
import { replaceValuesExpressions } from '../../../helpers/replace-values';
import { Lines } from './line-helper';

export const Diamond = React.forwardRef((props: ShapeTypeProps , ref: any) => {
	const settings = ShapeSettings.getShapeSettings(props.taskType, props.node);

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
		textDecoration = "line-through"
	} else 
	if (props.nodeState === "ok") {
		strokeColor = props.isSelected ? "#00f000" : "#00e000";
		fillColor = props.isSelected ? "#54ff54" : "#9dff9d";
	}
	
	return <>
		<Group
			x={props.x}
			y={props.y}
			ref={ref}
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
			opacity={props.canvasHasSelectedNode && !props.isSelected && !props.isConnectedToSelectedNode ? 0.15 : 1}
			>
			<RegularPolygon 
				x={ShapeMeasures.diamondSize/2}
				y={ShapeMeasures.diamondSize/2}
				stroke={strokeColor}
				strokeWidth={4}
				cornerRadius={4}
				sides={4}
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
				textDecoration={textDecoration}
				fontSize={18}
				ellipsis={true}
				fill={settings.textColor}
				perfectDrawEnabled={true}>
			</Text>
		</Group>
		<Lines flow={props.flow}
				node={props.node}
				getNodeInstance={props.getNodeInstance}
				canvasHasSelectedNode={props.canvasHasSelectedNode}
				selectedNode={props.selectedNode}
				isSelected={props.isSelected}
				shapeRefs={props.shapeRefs}
				onLineMouseOver={props.onLineMouseOver}
				onLineMouseOut={props.onLineMouseOut}
				onClickLine={props.onClickLine}
				canvasComponentInstance={props.canvasComponentInstance}
				touchedNodes={props.touchedNodes}
		></Lines>	
	</>
});