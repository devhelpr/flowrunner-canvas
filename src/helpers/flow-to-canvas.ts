import { ShapeMeasures } from './shape-measures';
import { getTaskConfigForTask } from '../config';
import { ThumbPositionRelativeToNode } from '../components/canvas/shapes/shape-types';
export class FlowToCanvas {
  static convertFlowPackageToCanvasFlow(flow) {
    if (flow === undefined) {
      return [];
    }
    const startPerf = performance.now();
    const resultFlow = flow.map((node, index) => {
      if (node.shapeType === 'line') {
        const shartShapes = flow.filter(startnode => startnode.name === node.startshapeid);
        const endShapes = flow.filter(endnode => endnode.name === node.endshapeid);

        if (shartShapes.length >= 1 && endShapes.length >= 1) {
          const startPosition = FlowToCanvas.getStartPointForLine(
            shartShapes[0],
            shartShapes[0],
            node,
            undefined,
            node.thumbPosition as ThumbPositionRelativeToNode,
          );
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
    console.log('convertFlowPackageToCanvasFlow performance', performance.now() - startPerf);
    return resultFlow;
  }

  static createFlowHashMap = flow => {
    const startPerf = performance.now();
    let flowHashMap = new Map();
    if (!flow) {
      return flowHashMap;
    }
    flow.map((node, index) => {
      if (node.shapeType !== 'Line') {
        //const nodeMap = flowHashMap[node.name];
        if (flowHashMap.has(node.name)) {
          flowHashMap.set(node.name, { ...flowHashMap.get(node.name), index: index });
          //nodeMap.index = index;
          //flowHashMap[node.name] = nodeMap;
        } else {
          flowHashMap.set(node.name, {
            index: index,
            start: [] as number[],
            end: [] as number[],
          });
        }
      } else {
        if (flowHashMap.has(node.startshapeid)) {
          let copy = flowHashMap.get(node.startshapeid);
          copy.start.push(index);
          flowHashMap.set(node.startshapeid, { ...copy });
          //startNode.start.push(index);
        } else {
          flowHashMap.set(node.startshapeid, {
            index: -1,
            start: [index] as number[],
            end: [] as number[],
          });
        }
        /*const startNode = flowHashMap[node.startshapeid];
				if (startNode) {
					startNode.start.push(index);
				} else {
					flowHashMap[node.startshapeid] = {
						index: -1,
						start: [index] as number[],
						end: [] as number[]
					}
				}
        */

        if (flowHashMap.has(node.endshapeid)) {
          let copy = flowHashMap.get(node.endshapeid);
          copy.end.push(index);
          flowHashMap.set(node.endshapeid, { ...copy });
        } else {
          flowHashMap.set(node.endshapeid, {
            index: -1,
            start: [] as number[],
            end: [index] as number[],
          });
        }
        /*
				const endNode = flowHashMap[node.endshapeid];
				if (endNode) {
					endNode.end.push(index);
				} else {
					flowHashMap[node.endshapeid] = {
						index: -1,
						start: [] as number[],
						end: [index] as number[]
					}
				}
        */
      }
    });
    console.log('createFlowHashMap', performance.now() - startPerf);

    return flowHashMap;
  };

  static getStartPointForLine(
    startShape,
    newPosition,
    lineNodeToCheckIfIsEvent?: any,
    getNodeInstance?: any,
    thumbPositionRelativeToNode?: ThumbPositionRelativeToNode,
    altThumbPositions?: boolean
  ) {
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
      let height: number | undefined = undefined;
      if (getNodeInstance && startShape) {
        const nodeInstance = getNodeInstance(startShape, undefined, undefined, taskSettings);
        if (nodeInstance && nodeInstance.getWidth) {
          width = nodeInstance.getWidth(startShape);
          height = nodeInstance.getHeight(startShape);
        }
      }
      /*
      let result = {
        //(isEvent ? 18 - 8 : 0)
        x: newPosition.x + (width || startShape.width || ShapeMeasures.htmlWidth) / 2,
        y:
          newPosition.y -
          (isEvent
            ? -32 + -4 - 32 - 8 + (height || startShape.height || ShapeMeasures.htmlHeight) / 2
            : -8 + -4 - 32 - 8 + (height || startShape.height || ShapeMeasures.htmlHeight) / 2),
      };
      */

      if (thumbPositionRelativeToNode == ThumbPositionRelativeToNode.bottom) {
        let bodyElement = document.querySelector('#' + startShape.name + ' .html-plugin-node');
        let element = document.querySelector(
          '#' + startShape.name + ' .canvas__html-shape-thumb-startbottom',
        ) as HTMLElement;
        if (!bodyElement) {
          bodyElement = document.querySelector('#' + startShape.name + ' .canvas__html-shape-body');
        }
        height = height || startShape.height || ShapeMeasures.htmlHeight;
        if (element && bodyElement) {
          height = bodyElement.clientHeight + 20;
        }

        return {
          x: newPosition.x + (width || startShape.width || ShapeMeasures.htmlWidth) / 2,
          y: newPosition.y + height + 4,
        };
      }

      return {
        x: newPosition.x + (width || startShape.width || ShapeMeasures.htmlWidth),
        y: newPosition.y - (isEvent ? -32 + -4 - 32 - 8 : -8 + -4 - 32 - 8),
      };

      //return result;
    } else if (shapeType == 'Circle') {
      return {
        x: newPosition.x + ShapeMeasures.circleSize,
        y: newPosition.y + ShapeMeasures.circleSize / 2,
      };
    } else if (shapeType == 'Diamond') {
      if (thumbPositionRelativeToNode == ThumbPositionRelativeToNode.left) {
        return {
          x: newPosition.x ,
          y: newPosition.y + ShapeMeasures.diamondSize / 2,
        };
      } else
      if (thumbPositionRelativeToNode == ThumbPositionRelativeToNode.right) {
        return {
          x: newPosition.x + ShapeMeasures.diamondSize / 2,
          y: newPosition.y + ShapeMeasures.diamondSize / 2,
        };
      } else 
      if (thumbPositionRelativeToNode == ThumbPositionRelativeToNode.top) {
        return {
          x: newPosition.x + ShapeMeasures.diamondSize / 2,
          y: newPosition.y,
        };
      } else if (thumbPositionRelativeToNode == ThumbPositionRelativeToNode.bottom) {
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

  static getEndPointForLine(
    endShape,
    newPosition,
    nodeParameterThatIsNotUsed?: any,
    getNodeInstance?: any,
    thumbPositionRelativeToNode?: ThumbPositionRelativeToNode,
    altThumbPositions?: boolean
  ) {
    const taskSettings = FlowToCanvas.getTaskSettings(endShape.taskType);
    const shapeType = FlowToCanvas.getShapeTypeUsingSettings(
      endShape.shapeType,
      endShape.taskType,
      endShape.isStartEnd,
      taskSettings,
    );

    if (shapeType == 'Html') {
      /*
      let width = undefined;
      let height = undefined;
      if (getNodeInstance && endShape) {
        const nodeInstance = getNodeInstance(endShape, undefined, undefined, taskSettings);
        if (nodeInstance && nodeInstance.getWidth) {
          width = nodeInstance.getWidth(endShape);
          height = nodeInstance.getHeight(endShape);
        }
      }
      
      let endpoint = {
        x: newPosition.x - (width || endShape.width || ShapeMeasures.htmlWidth) / 2 - 8,
        y: newPosition.y - (height || endShape.height || ShapeMeasures.htmlHeight) / 2 + 40 + 12,
      };
      */

      let width = undefined;
      let height = undefined;
      if (getNodeInstance && endShape) {
        const nodeInstance = getNodeInstance(endShape, undefined, undefined, taskSettings);
        if (nodeInstance && nodeInstance.getWidth) {
          width = nodeInstance.getWidth(endShape);
          height = nodeInstance.getHeight(endShape);
        }
      }

      if (thumbPositionRelativeToNode == ThumbPositionRelativeToNode.top) {
        return {
          x: newPosition.x + (width || endShape.width || ShapeMeasures.htmlWidth) / 2,
          y: newPosition.y - 12,
        };
      }
      return {
        x: newPosition.x - 8,
        y: newPosition.y + 40 + 12,
      };
      //return endpoint;
    } else if (shapeType == 'Circle') {
      return {
        x: newPosition.x,
        y: newPosition.y + ShapeMeasures.circleSize / 2,
      };
    } else if (shapeType == 'Diamond') {
      if (thumbPositionRelativeToNode == ThumbPositionRelativeToNode.top) {
        return {
          x: newPosition.x + ShapeMeasures.diamondSize / 2,
          y: newPosition.y ,
        };
      }
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

  static getLinesForStartNodeFromCanvasFlow(flow: any, startNode: any, flowHashMap: any) {
    if (flow === undefined || startNode === undefined || flowHashMap == undefined) {
      return false;
    }
    const startConnection = flowHashMap.get(startNode.name);
    if (startConnection) {
      let nodes: any[] = [];
      flowHashMap.get(flow[startConnection.index].name).start.map(startIndex => {
        let connection = flow[startIndex];
        if (connection) {
          nodes.push(connection);
        }
      });
      return nodes;
    }
    return false;

    return flow.filter(node => {
      return node.shapeType === 'Line' && node.startshapeid === startNode.name;
    });
  }

  static getLinesForEndNodeFromCanvasFlow(flow: any, endNode: any, flowHashMap: any) {
    if (flow === undefined || endNode === undefined || flowHashMap == undefined) {
      return false;
    }

    const endConnection = flowHashMap.get(endNode.name);
    if (endConnection) {
      let nodes: any[] = [];
      flowHashMap.get(flow[endConnection.index].name).end.map(endIndex => {
        let connection = flow[endIndex];
        if (connection) {
          nodes.push(connection);
        }
      });
      return nodes;
    }
    return false;

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

  static getThumbEndPosition(
    shapeType: string,
    position: any,
    offset?,
    positionRelativeToNode?: ThumbPositionRelativeToNode,
  ) {
    if (shapeType == 'Diamond') {
      if (positionRelativeToNode === ThumbPositionRelativeToNode.top) {
        return {      
          x: position.x + ShapeMeasures.diamondSize / 2,
          y: position.y - 12,
        };
      }
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

    /*
    if (shapeType == 'Html') {
      if (positionRelativeToNode === ThumbPositionRelativeToNode.top) {
        return {
          x: position.x + 100,
          y: position.y - 12,
        };
      }
    }
    */

    return {
      x: position.x,
      y: position.y,
    };
  }

  static getThumbStartPosition(
    shapeType: string,
    position: any,
    offset,
    positionRelativeToNode?: ThumbPositionRelativeToNode,
  ) {
    if (shapeType == 'Diamond') {
      if (positionRelativeToNode === ThumbPositionRelativeToNode.left) {
        return {
          x: position.x - ShapeMeasures.diamondSize,
          y: position.y + offset * 24 - 12 + ShapeMeasures.diamondSize / 2,
        };
      } else
      if (positionRelativeToNode === ThumbPositionRelativeToNode.right) {
        return {
          x: position.x,
          y: position.y + offset * 24 - 12 + ShapeMeasures.diamondSize / 2,
        };
      } else
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

    /*if (shapeType == 'Html') {
      if (positionRelativeToNode === ThumbPositionRelativeToNode.bottom) {
        return {
          x: position.x + 100,
          y: position.y - 12,
        };
      }
    }
    */

    return {
      x: position.x,
      y: position.y + offset * 24,
    };
  }
}
