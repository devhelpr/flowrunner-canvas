import * as React from 'react';

import { Group, Text, Ellipse as KonvaEllipse } from 'react-konva';
import { ShapeTypeProps } from './shape-types';
import { ShapeMeasures } from '../../../helpers/shape-measures';
import { ShapeSettings } from '../../../helpers/shape-settings';
import { getLines } from './line-helper';

export const Ellipse = React.forwardRef((props: ShapeTypeProps, ref: any) => {
	const settings = ShapeSettings.getShapeSettings(props.taskType, props.node);
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
			<KonvaEllipse 
				x={ShapeMeasures.rectWidht/2}
				y={ShapeMeasures.rectHeight/2}
				radiusX={100}
				radiusY={50}
				stroke={settings.strokeColor}
				strokeWidth={4}
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
				listening={false}
				wrap="none"
				fontSize={18}
				ellipsis={true}
				fill={settings.textColor}
				perfectDrawEnabled={true}>
			</Text>
		</Group>
		{
			getLines(
					props.flow, 
					props.node,
					props.getNodeInstance,
					props.canvasHasSelectedNode,
					props.selectedNode,
					props.isSelected,props.shapeRefs,
					props.onLineMouseOver,
					props.onLineMouseOut,
					props.onClickLine,
					props.canvasComponentInstance,
					props.touchedNodes
			)
		}
	</>;
});