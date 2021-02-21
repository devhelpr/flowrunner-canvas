import { ShapeMeasures } from './shape-measures';
import { getTaskConfigForTask } from '../config';
import { ThumbPositionRelativeToNode } from '../components/canvas/shapes/shape-types';
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
          const startPosition = FlowToCanvas.getStartPointForLine(shartShapes[0], shartShapes[0], node, undefined, 
            node.thumbPosition as ThumbPositionRelativeToNode);
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

  static getStartPointForLine(startShape, newPosition, lineNodeToCheckIfIsEvent?: any, getNodeInstance?: any,
    thumbPositionRelativeToNode?: ThumbPositionRelativeToNode) {
    const taskSettings = FlowToCanvas.getTaskSettings(startShape.taskType);
    const shapeType = FlowToCanvas.getShapeTypeUsingSettings(
      startShape.shapeType,
      startShape.taskType,
      startShape.isStartEnd,
      taskSettings,
    );
    let isEvent: boolean = false;
    if (lineNodeToCheckIfIsEvent && lineNodeToCheckIfIsEvent.event && lineNodeToCheckIfIsEvent.event !== '') {
      isEvent = true;
    }

    if (shapeType == 'Html') {
      let width = undefined;
      let height = undefined;
      if (getNodeInstance && startShape) {
        const nodeInstance = getNodeInstance(startShape, undefined, undefined, taskSettings);
        if (nodeInstance && nodeInstance.getWidth) {
          width = nodeInstance.getWidth(startShape);
          height = nodeInstance.getHeight(startShape);
        }
      }
      let result = {
        //(isEvent ? 18 - 8 : 0)
        x: newPosition.x + (width || startShape.width || ShapeMeasures.htmlWidth) / 2,
        y:
          newPosition.y -
          (isEvent
            ? -32 + -4 - 32 - 8 + (height || startShape.height || ShapeMeasures.htmlHeight) / 2
            : -8 + -4 - 32 - 8 + (height || startShape.height || ShapeMeasures.htmlHeight) / 2),
      };

      return result;
    } else if (shapeType == 'Circle') {
      return {
        x: newPosition.x + ShapeMeasures.circleSize,
        y: newPosition.y + ShapeMeasures.circleSize / 2,
      };
    } else if (shapeType == 'Diamond') {
      if (thumbPositionRelativeToNode == ThumbPositionRelativeToNode.top) {
        return {
          x: newPosition.x + ShapeMeasures.diamondSize / 2,
          y: newPosition.y,
        };
      } else
      if (thumbPositionRelativeToNode == ThumbPositionRelativeToNode.bottom) {
        return {
          x: newPosition.x + ShapeMeasures.diamondSize / 2,
          y: newPosition.y + ShapeMeasures.diamondSize,
        };
      }
      return {
        x: newPosition.x + ShapeMeasures.diamondSize,
        y: newPosition.y + ShapeMeasures.diamondSize / 2,
      };
    } else {
      let skewXOffset = 0;
      if (taskSettings.isSkewed) {
        skewXOffset = ShapeMeasures.rectWidht / 8 - 4;
      }
      return {
        // + (isEvent ? 18 - 14 : 0)
        x: newPosition.x + ShapeMeasures.rectWidht + skewXOffset,
        y: newPosition.y + ShapeMeasures.rectHeight / 2 - 12 + (isEvent ? 4 + 8 + 24 : 4 + 8),
      };
      // y: newPosition.y + (isEvent ? 4 + 8 : ShapeMeasures.rectHeight / 2),
    }
  }

  static getEndPointForLine(endShape, newPosition, nodeParameterThatIsNotUsed?: any, getNodeInstance?: any) {
    const taskSettings = FlowToCanvas.getTaskSettings(endShape.taskType);
    const shapeType = FlowToCanvas.getShapeTypeUsingSettings(
      endShape.shapeType,
      endShape.taskType,
      endShape.isStartEnd,
      taskSettings,
    );

    if (shapeType == 'Html') {
      let width = undefined;
      let height = undefined;
      if (getNodeInstance && endShape) {
        const nodeInstance = getNodeInstance(endShape, undefined, undefined, taskSettings);
        if (nodeInstance && nodeInstance.getWidth) {
          width = nodeInstance.getWidth(endShape);
          height = nodeInstance.getHeight(endShape);
        }
      }
      const endpoint = {
        x: newPosition.x - (width || endShape.width || ShapeMeasures.htmlWidth) / 2 - 8,
        y: newPosition.y - (height || endShape.height || ShapeMeasures.htmlHeight) / 2 + 40 + 12,
      };
      return endpoint;
    } else if (shapeType == 'Circle') {
      return {
        x: newPosition.x,
        y: newPosition.y + ShapeMeasures.circleSize / 2,
      };
    } else if (shapeType == 'Diamond') {
      return {
        x: newPosition.x - 6 - 2,
        y: newPosition.y + ShapeMeasures.diamondSize / 2,
      };
    } else {
      let skewXOffset = 0;
      if (taskSettings.isSkewed) {
        skewXOffset = ShapeMeasures.rectWidht / 8 - 8;
      }
      return {
        x: newPosition.x + skewXOffset - 8,
        y: newPosition.y + ShapeMeasures.rectHeight / 2 - 12 + (4 + 8),
      };
      //y: newPosition.y + ShapeMeasures.rectHeight / 2,
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

  static getTaskSettings(taskType) {
    return getTaskConfigForTask(taskType);
  }

  static getShapeTypeUsingSettings(shapeType, taskType, isStartEnd, taskSettings) {
    let resultShapeType = shapeType || 'Rect';
    if (taskSettings && taskSettings.shapeType) {
      resultShapeType = taskSettings.shapeType;
    }
    if (isStartEnd && resultShapeType == 'Rect') {
      resultShapeType = 'Ellipse';
    } else if (taskSettings && !!taskSettings.isStartEnd) {
      resultShapeType = 'Ellipse';
    }
    return resultShapeType;
  }

  static getShapeType(shapeType, taskType, isStartEnd) {
    let resultShapeType = shapeType || 'Rect';
    const shapeSetting = getTaskConfigForTask(taskType);
    if (shapeSetting && shapeSetting.shapeType) {
      resultShapeType = shapeSetting.shapeType;
    }
    if (isStartEnd && resultShapeType == 'Rect') {
      resultShapeType = 'Ellipse';
    } else if (shapeSetting && !!shapeSetting.isStartEnd) {
      resultShapeType = 'Ellipse';
    }
    return resultShapeType;
  }

  static getThumbEndPosition(shapeType: string, position: any) {
    if (shapeType == 'Diamond') {
      return {
        x: position.x,
        y: position.y + ShapeMeasures.diamondSize / 2 - 12,
      };
    }

    if (shapeType == 'Rect') {
      return {
        x: position.x,
        y: position.y + ShapeMeasures.rectHeight / 2 - 12,
      };
    }

    return {
      x: position.x,
      y: position.y,
    };
  }

  static getThumbStartPosition(shapeType: string, 
      position: any, 
      offset, 
      positionRelativeToNode? : ThumbPositionRelativeToNode) {
    if (shapeType == 'Diamond') {
      if (positionRelativeToNode === ThumbPositionRelativeToNode.top) {
        return {
          x: position.x - ShapeMeasures.diamondSize / 2,
          y: position.y + offset * 24 - 12,
        };
      } else
      if (positionRelativeToNode === ThumbPositionRelativeToNode.bottom) {
        return {
          x: position.x - ShapeMeasures.diamondSize / 2,
          y: position.y + ShapeMeasures.diamondSize + offset * 24 - 12,
        };
      }

      return {
        x: position.x,
        y: position.y + ShapeMeasures.diamondSize / 2 + offset * 24 - 12,
      };
    }
    if (shapeType == 'Rect') {
      return {
        x: position.x,
        y: position.y + ShapeMeasures.rectHeight / 2 + offset * 24 - 12,
      };
    }
    return {
      x: position.x,
      y: position.y + offset * 24,
    };
  }
}
