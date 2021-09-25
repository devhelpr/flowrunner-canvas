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
	flowHash?: any;
}

export const LineHelper = (props : ILineHelperProps) => {

	
	const endNode = useMemo(() => {
		const endIndex = props.flowHash.get(props.endshapeid).index;
		if (endIndex < 0) {
			return false;
		}
		return props.flow[endIndex];	
	}, [props.node.name, props.flow, props.flowHash, props.endshapeid]);
	
	/*
	const endNodes = useMemo(() => { 
		return props.flow.filter((node) => {
			return node.name == props.endshapeid;
		});
	}, [props.flow, props.node.name, props.endshapeid]);
	if (endNodes.length == 0) {
		return null;
	}
	let endNode = endNodes[0];
	*/
	if (!endNode) {
		return null;
	}
	
	let positionNode = props.positions(endNode.name) || endNode;
	const newEndPosition =  FlowToCanvas.getEndPointForLine(endNode, {
		x: positionNode.x,
		y: positionNode.y
	}, endNode, props.getNodeInstance,
		props.lineNode.thumbEndPosition as ThumbPositionRelativeToNode || ThumbPositionRelativeToNode.default);

	// 
	// 
	return <Line
		ref={ref => (props.shapeRefs.current[props.lineNode.name] = ref)}									
		onMouseOver={(event) => props.onLineMouseOver(props.lineNode, event)}
		onMouseOut={(event) => props.onLineMouseOut(props.lineNode, event)}
		onClickLine={(event) => props.onClickLine(props.lineNode, event)}
		canvasHasSelectedNode={props.canvasHasSelectedNode}
		isSelected={false}
							
		isErrorColor={props.lineNode.followflow === 'onfailure'}
		isSuccessColor={props.lineNode.followflow === 'onsuccess'}
		xstart={props.newStartPosition.x} 
		ystart={props.newStartPosition.y}
		xend={newEndPosition.x} 
		yend={newEndPosition.y}
		isEventNode={props.lineNode.event !== undefined && props.lineNode.event !== ""}
		selectedNodeName={""}
		startNodeName={props.lineNode.startshapeid}
		endNodeName={props.lineNode.endshapeid}
		noMouseEvents={false}	
		touchedNodes={props.touchedNodes}
		name={props.lineNode.name}
		thumbPosition={props.lineNode.thumbPosition || ThumbPositionRelativeToNode.default}
		thumbEndPosition={props.lineNode.thumbEndPosition || ThumbPositionRelativeToNode.default}											
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
	flowHash? : any;
}

export const Lines = (
		props : ILinesProp
	) => {

		
	const lines = useMemo(() => {
		return props.flowHash.get(props.node.name).start.map((lineIndex, index) => {
			return props.flow[lineIndex];
		});	
	}, [props.node.name, props.flow, props.flowHash]);
	/*
	const lines = useMemo(() => {
		return props.flow.filter((lineNode, index) => {		
			if (lineNode.startshapeid == props.node.name && lineNode.shapeType === "Line") {
				return true;
			}
			return false;
			})}
		 , [props.node.name, props.flow]);
	*/
	return <>{lines.map((lineNode, index) => {		
			/*
				- lijnen vanuit de huidige node naar een andere node
			*/
			let newPosition ={x:props.node.x, y:props.node.y};
			newPosition = props.positions(props.node.name) || newPosition;

			const newStartPosition =  FlowToCanvas.getStartPointForLine(props.node, newPosition, lineNode, props.getNodeInstance,
				lineNode.thumbPosition as ThumbPositionRelativeToNode || ThumbPositionRelativeToNode.default);
			
			return <React.Fragment key={index}><LineHelper
					flow={props.flow}
					flowHash={props.flowHash}
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
			</React.Fragment>;
		})
	}</>;
}