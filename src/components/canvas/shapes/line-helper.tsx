import * as React from 'react';
import { Line } from './line';
import { FlowToCanvas } from '../../../helpers/flow-to-canvas';

export const getLines = (
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
		canvasComponentInstance,
		touchedNodes
	) => {
	return flow.map((lineNode, index) => {		
		if (lineNode.startshapeid == node.name && lineNode.shapeType === "Line") {

			/*
				- lijnen vanuit de huidige node naar een andere node
			*/
			let newPosition ={x:node.x, y:node.y};
			const newStartPosition =  FlowToCanvas.getStartPointForLine(node, newPosition, lineNode, getNodeInstance);
			let endNodes = flow.filter((node) => {
				return node.name == lineNode.endshapeid;
			})
			let endNode = endNodes[0];
			const newEndPosition =  FlowToCanvas.getEndPointForLine(endNode, {
				x: endNode.x,
				y: endNode.y
			}, endNode, getNodeInstance);

			return <Line key={"node-"+index}
				ref={shapeRefs[lineNode.name]}									
				onMouseOver={onLineMouseOver.bind(canvasComponentInstance, lineNode)}
				onMouseOut={onLineMouseOut.bind(canvasComponentInstance, lineNode)}
				onClickLine={onClickLine.bind(canvasComponentInstance, lineNode)}
				canvasHasSelectedNode={canvasHasSelectedNode}
				isSelected={selectedNode && selectedNode.node && 
					selectedNode.node.name === lineNode.name}
									
				isErrorColor={lineNode.followflow === 'onfailure'}
				isSuccessColor={lineNode.followflow === 'onsuccess'}
				xstart={newStartPosition.x} 
				ystart={newStartPosition.y}
				xend={newEndPosition.x} 
				yend={newEndPosition.y}
				isEventNode={lineNode.event !== undefined && lineNode.event !== ""}
				selectedNodeName={isSelected && selectedNode && 
					selectedNode.node ?selectedNode.node.name : ""}
				startNodeName={lineNode.startshapeid}
				endNodeName={lineNode.endshapeid}
				noMouseEvents={false}	
				touchedNodes={touchedNodes}
				name={lineNode.name}											
			></Line>;
		} 
		return null;
	})
}