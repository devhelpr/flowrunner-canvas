import * as React from 'react';
import { useMemo, useRef } from 'react';
import { Line } from './line';
import { FlowToCanvas } from '../../../helpers/flow-to-canvas';
import { ErrorBoundary } from '../../../helpers/error';
import { ThumbPositionRelativeToNode } from './shape-types';

export interface ILineHelperProps {
	flow: any[],
	endshapeid : string,
	node,
	lineNode,
	getNodeInstance : any, 
	canvasHasSelectedNode : boolean, 
	isSelected : boolean,
	selectedNode : any, 
	shapeRefs,
	onLineMouseOver,
	onLineMouseOut,
	onClickLine,
	touchedNodes,
	newStartPosition,
	positions: any;
}

export const LineHelper = (props : ILineHelperProps) => {
	const endNodes = useMemo(() => { 
		return props.flow.filter((node) => {
			return node.name == props.endshapeid;
		});
	}, [props.flow, props.node.name, props.endshapeid]);

	let endNode = endNodes[0];
	let positionNode = props.positions[endNode.name] || endNode;
	const newEndPosition =  FlowToCanvas.getEndPointForLine(endNode, {
		x: positionNode.x,
		y: positionNode.y
	}, endNode, props.getNodeInstance);

	// 
	// 
	return <Line
		ref={ref => (props.shapeRefs.current[props.lineNode.name] = ref)}									
		onMouseOver={(event) => props.onLineMouseOver(props.lineNode, event)}
		onMouseOut={(event) => props.onLineMouseOut(props.lineNode, event)}
		onClickLine={(event) => props.onClickLine(props.lineNode, event)}
		canvasHasSelectedNode={props.canvasHasSelectedNode}
		isSelected={props.selectedNode && props.selectedNode.node && 
			props.selectedNode.node.name === props.lineNode.name}
							
		isErrorColor={props.lineNode.followflow === 'onfailure'}
		isSuccessColor={props.lineNode.followflow === 'onsuccess'}
		xstart={props.newStartPosition.x} 
		ystart={props.newStartPosition.y}
		xend={newEndPosition.x} 
		yend={newEndPosition.y}
		isEventNode={props.lineNode.event !== undefined && props.lineNode.event !== ""}
		selectedNodeName={props.isSelected && props.selectedNode && 
			props.selectedNode.node ? props.selectedNode.node.name : ""}
		startNodeName={props.lineNode.startshapeid}
		endNodeName={props.lineNode.endshapeid}
		noMouseEvents={false}	
		touchedNodes={props.touchedNodes}
		name={props.lineNode.name}
		thumbPosition={props.lineNode.thumbPosition || ThumbPositionRelativeToNode.default}											
	></Line>;
}

export interface ILinesProp {
	flow : any[], 
	node : any, 
	getNodeInstance : any, 
	canvasHasSelectedNode : boolean, 
	isSelected : boolean,
	selectedNode : any, 
	shapeRefs,
	onLineMouseOver,
	onLineMouseOut,
	onClickLine,
	touchedNodes,
	positions?: any;
}

export const Lines = (
		props : ILinesProp
	) => {

	const lines = useMemo(() => {
		return props.flow.filter((lineNode, index) => {		
			if (lineNode.startshapeid == props.node.name && lineNode.shapeType === "Line") {
				return true;
			}
			return false;
			})}
		 , [props.node.name, props.flow]);

	// TODO: use memoize here to prevent looping through the whole flow map on
	// every render .. needs cache keys for flow and node.name
	return <>{lines.map((lineNode, index) => {		
			/*
				- lijnen vanuit de huidige node naar een andere node
			*/
			let newPosition ={x:props.node.x, y:props.node.y};
			newPosition = props.positions[props.node.name] || newPosition;

			const newStartPosition =  FlowToCanvas.getStartPointForLine(props.node, newPosition, lineNode, props.getNodeInstance,
				lineNode.thumbPosition as ThumbPositionRelativeToNode || ThumbPositionRelativeToNode.default);
			
			return <React.Fragment key={index}><ErrorBoundary><LineHelper
					flow={props.flow}
					positions={props.positions}
					endshapeid={lineNode.endshapeid}
					node={props.node}
					lineNode={lineNode}
					getNodeInstance={props.getNodeInstance}
					canvasHasSelectedNode={props.canvasHasSelectedNode}
					isSelected={props.isSelected}
					selectedNode={props.selectedNode}
					shapeRefs={props.shapeRefs}
					onLineMouseOver={props.onLineMouseOver}
					onLineMouseOut={props.onLineMouseOut}
					onClickLine={props.onClickLine}
					touchedNodes={props.touchedNodes}	
					newStartPosition={newStartPosition}></LineHelper>		
			</ErrorBoundary></React.Fragment>;
		})
	}</>;
}