import { ShapeMeasures } from './shape-measures';

export class FlowToCanvas {
	static convertFlowPackageToCanvasFlow(flow) {
		if (flow === undefined) {
			return [];
		}
		return flow.map((node, index) => {
			if (node.shapeType === "line") {
				

				const shartShapes = flow.filter((startnode) => startnode.name === node.startshapeid);
				const endShapes = flow.filter((endnode) => endnode.name === node.endshapeid);

				if (shartShapes.length >= 1 && endShapes.length >= 1) {

					const startPosition = FlowToCanvas.getStartPointForLine(shartShapes[0]);
					const endPosition = FlowToCanvas.getEndPointForLine(endShapes[0]);
					return Object.assign({} , node , {
						shapeType: "Line",
						xstart: startPosition.x,
						ystart: startPosition.y,
						xend: endPosition.x,
						yend: endPosition.y
					});				
				}
				return node;
			} 
			return node;
		})
	};

	static getStartPointForLine(startShape) {
		if (startShape.shapeType == "Circle") {
			return {
				x: startShape.x + ShapeMeasures.circleSize,
				y: startShape.y + (ShapeMeasures.circleSize/2)
			}
		} else {
			return {
				x: startShape.x + ShapeMeasures.rectWidht,
				y: startShape.y + (ShapeMeasures.rectHeight/2)
			}
		}
	}

	static getEndPointForLine(endShape) {
		if (endShape.shapeType == "Circle") {
			return {
				x: endShape.x,
				y: endShape.y + 40
			}
		} else {
			return {
				x: endShape.x,
				y: endShape.y + 40
			}
		}
	}
	
}