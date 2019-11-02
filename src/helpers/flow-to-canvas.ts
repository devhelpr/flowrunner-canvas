import { ShapeMeasures } from './shape-measures';
import { taskTypeConfig } from '../config';

export class FlowToCanvas {
  static convertFlowPackageToCanvasFlow(flow) {
    if (flow === undefined) {
      return [];
    }
    return flow.map((node, index) => {
      if (node.shapeType === 'line') {
        const shartShapes = flow.filter(startnode => startnode.name === node.startshapeid);
        const endShapes = flow.filter(endnode => endnode.name === node.endshapeid);

        if (shartShapes.length >= 1 && endShapes.length >= 1) {
          const startPosition = FlowToCanvas.getStartPointForLine(shartShapes[0], shartShapes[0]);
          const endPosition = FlowToCanvas.getEndPointForLine(endShapes[0], endShapes[0]);
          return Object.assign({}, node, {
            shapeType: 'Line',
            xstart: startPosition.x,
            ystart: startPosition.y,
            xend: endPosition.x,
            yend: endPosition.y,
          });
        }
        return node;
      }
      return node;
    });
  }

  static getStartPointForLine(startShape, newPosition) {
    const shapeType = FlowToCanvas.getShapeType(startShape.shapeType, startShape.taskType, startShape.isStartEnd);

    if (shapeType == 'Circle' || shapeType == 'Diamond') {
      return {
        x: newPosition.x + ShapeMeasures.circleSize,
        y: newPosition.y + ShapeMeasures.circleSize / 2,
      };
    } else {
      return {
        x: newPosition.x + ShapeMeasures.rectWidht,
        y: newPosition.y + ShapeMeasures.rectHeight / 2,
      };
    }
  }

  static getEndPointForLine(endShape, newPosition) {
    const shapeType = FlowToCanvas.getShapeType(endShape.shapeType, endShape.taskType, endShape.isStartEnd);

    if (shapeType == 'Circle' || shapeType == 'Diamond') {
      return {
        x: newPosition.x,
        y: newPosition.y + ShapeMeasures.circleSize / 2,
      };
    } else {
      return {
        x: newPosition.x,
        y: newPosition.y + ShapeMeasures.rectHeight / 2,
      };
    }
  }

  static getLinesForStartNodeFromCanvasFlow(flow: any, startNode: any) {
    if (flow === undefined || startNode === undefined) {
      return false;
    }

    return flow.filter(node => {
      return node.shapeType === 'Line' && node.startshapeid === startNode.name;
    });
  }

  static getLinesForEndNodeFromCanvasFlow(flow: any, endNode: any) {
    if (flow === undefined || endNode === undefined) {
      return false;
    }

    return flow.filter(node => {
      return node.shapeType === 'Line' && node.endshapeid === endNode.name;
    });
  }

  static getShapeType(shapeType, taskType, isStartEnd) {
    let resultShapeType = shapeType || 'Rect';
    const shapeSetting = taskTypeConfig[taskType];
    if (shapeSetting && shapeSetting.shapeType) {
      resultShapeType = shapeSetting.shapeType;
    }
    if (isStartEnd && resultShapeType == 'Rect') {
      resultShapeType = 'Ellipse';
    }
    return resultShapeType;
  }
}
