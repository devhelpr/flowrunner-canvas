import * as React from 'react';
import { Line } from './line';
import { FlowToCanvas } from '../../../helpers/flow-to-canvas';

export const getLines = (flow: any[], node : any, getNodeInstance : any, canvasHasSelectedNode : boolean, isSelected: boolean, shapeRefs) => {
	return flow.map((lineNode, index) => {
		
		if (lineNode.startshapeid == node.name && lineNode.shapeType === "Line") {

			/*
				- lijnen vanuit de huidige node naar een andere node
			*/
			let newPosition ={x:node.x, y:node.y};
			const newStartPosition =  FlowToCanvas.getStartPointForLine(node, newPosition, node, getNodeInstance);
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
				onMouseOver={undefined}
				onMouseOut={undefined}
				onClickLine={undefined}
				canvasHasSelectedNode={canvasHasSelectedNode}
				isSelected={false}
				isErrorColor={lineNode.followflow === 'onfailure'}
				isSuccessColor={lineNode.followflow === 'onsuccess'}
				xstart={newStartPosition.x} 
				ystart={newStartPosition.y}
				xend={newEndPosition.x} 
				yend={newEndPosition.y}
				isEventNode={lineNode.event !== undefined && lineNode.event !== ""}
				selectedNodeName={isSelected ? node.name : ""}
				startNodeName={lineNode.startshapeid}
				endNodeName={lineNode.endshapeid}
				noMouseEvents={false}												
			></Line>;
		} 
		return null;
	})
}