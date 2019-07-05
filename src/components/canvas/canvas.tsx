import * as React from 'react';
import { Stage, Layer , Rect } from 'react-konva';
import { Shapes } from './shapes'; 
import { ShapeTypeProps } from './shapes/shape-types';

export interface CanvasProps {
	nodes : any[]
}

export const Canvas = (props : CanvasProps) => {
	
	return <>
		<Stage
			draggable={true}
			pixelRatio={1} 
			width={ 1024 } 
			height={ 750 } className="stage-container">
			<Layer>
				<Rect x={0} y={0} width={1024} height={750}></Rect>
				{props.nodes.map((node, index) => {
					let Shape = Shapes[node.shapeType];
					if (node.shapeType === "line") {
						Shape = Shapes["Line"];

						const shartShapes = props.nodes.filter((startnode) => startnode.name === node.startshapeid);
						const endShapes = props.nodes.filter((endnode) => endnode.name === node.endshapeid);

						if (shartShapes.length >= 1 && endShapes.length >= 1) {
							return <Shape key={"node-"+index}
								xstart={shartShapes[0].x+80} 
								ystart={shartShapes[0].y+40}
								xend={endShapes[0].x} 
								yend={endShapes[0].y+40}></Shape>;
						}
						return null;
					} else
					if (Shape) {
						return <Shape key={"node-"+index} 
							x={node.x} 
							y={node.y} 
							name={node.name}></Shape>;
					}
					return null;
				})}
				
			</Layer>
		</Stage>
	</>
} 