import * as React from 'react';
import { Lines } from './line-helper';

import { ShapeTypeProps } from './shape-types';

export const LinesForShape = (props: ShapeTypeProps) => {
	return <Lines flow={props.flow}
		node={props.node}
		getNodeInstance={props.getNodeInstance}
		canvasHasSelectedNode={props.canvasHasSelectedNode}
		selectedNode={props.selectedNode}
		isSelected={props.isSelected}
		shapeRefs={props.shapeRefs}
		onLineMouseOver={props.onLineMouseOver}
		onLineMouseOut={props.onLineMouseOut}
		onClickLine={props.onClickLine}
		touchedNodes={props.touchedNodes}
		positions={props.positions}
	></Lines>;	
};
