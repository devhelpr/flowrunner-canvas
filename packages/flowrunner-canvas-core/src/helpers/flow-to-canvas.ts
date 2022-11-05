import { ShapeMeasures } from './shape-measures';
import { getTaskConfigForTask } from '../config';
import { ThumbPositionRelativeToNode } from '../interfaces/shape-types';
import { IPosition, IPositionContext } from '../contexts/position-context';
import { ShapeSettings } from './shape-settings';
import { pointOnRect } from './intersect';
import { cubicBezierAABB } from 'bezier-intersect';
import { calculateLineControlPoints } from './line-points';
import { INodeMapInfo, TFlowMap } from '../interfaces/IFlowMap';

export class FlowToCanvas {
  static convertFlowPackageToCanvasFlow(flow, positionContext?: IPositionContext) {
    if (flow === undefined) {
      return [];
    }
    const startPerf = performance.now();
    const resultFlow = flow.map((node, index) => {
      if (node.shapeType === 'line') {
        const shartShapes = flow.filter((startnode) => startnode.name === node.startshapeid);
        const endShapes = flow.filter((endnode) => endnode.name === node.endshapeid);

        if (shartShapes.length >= 1 && endShapes.length >= 1) {
          const startPosition = FlowToCanvas.getStartPointForLine(
            shartShapes[0],
            shartShapes[0],
            undefined,
            undefined,
            node,
            undefined,
            node.thumbPosition as ThumbPositionRelativeToNode,
          );
          const endPosition = FlowToCanvas.getEndPointForLine(
            endShapes[0],
            endShapes[0],
            shartShapes[0],
            shartShapes[0],
          );
          return Object.assign({}, node, {
            shapeType: 'Line',
            xstart: startPosition.x,
            ystart: startPosition.y,
            xend: endPosition.x,
            yend: endPosition.y,
          });
        }
        return node;
      } else {
        let position: IPosition | undefined = undefined;
        if (positionContext) {
          position = positionContext.positions.get(node.name);
        }
        return {
          ...node,
          ...position,
        };
      }
    });
    console.log('convertFlowPackageToCanvasFlow performance', performance.now() - startPerf);
    return resultFlow;
  }

  static createFlowHashMap = (flow) => {
    const startPerf = performance.now();
    let flowHashMap: TFlowMap = new Map();
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
          if (copy && copy.start) {
            copy.start.push(index);
            flowHashMap.set(node.startshapeid, { ...copy });
          }
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
          if (copy && copy.end) {
            copy.end.push(index);
            flowHashMap.set(node.endshapeid, { ...copy });
          }
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
    endNode?: any,
    endNodePosition?: any,
    lineNodeToCheckIfIsEvent?: any,
    getNodeInstance?: any,
    thumbPositionRelativeToNode?: ThumbPositionRelativeToNode,
    altThumbPositions?: boolean,
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

    const nodeAttachedToCenter = startShape.lineConnectionEndPoints === 'center-of-node';

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

      width = width || taskSettings.width || startShape.width || ShapeMeasures.htmlWidth;
      height = height || taskSettings.height || startShape.height || ShapeMeasures.htmlHeight;

      if (thumbPositionRelativeToNode == ThumbPositionRelativeToNode.bottom) {
        let bodyElement = document.querySelector('#' + startShape.name + ' .html-plugin-node');
        let element = document.querySelector(
          '#' + startShape.name + ' .canvas__html-shape-thumb-startbottom',
        ) as HTMLElement;
        if (!bodyElement) {
          bodyElement = document.querySelector('#' + startShape.name + ' .canvas__html-shape-body');
        }

        if (element && bodyElement) {
          height = bodyElement.clientHeight + 20;
        }

        if (!!nodeAttachedToCenter) {
          return {
            x: newPosition.x + (width || startShape.width || ShapeMeasures.htmlWidth) / 2,
            y: newPosition.y + (height || 0) / 2,
          };
        }

        return {
          x: newPosition.x + (width || startShape.width || ShapeMeasures.htmlWidth) / 2,
          y: newPosition.y + height + 4,
        };
      }

      if (taskSettings.htmlPlugin === 'shapeNode') {
        height = height || 0;

        if (!!nodeAttachedToCenter) {
          //console.log("startpoint w", startShape.name, width , taskSettings.width ,startShape.width ,ShapeMeasures.htmlWidth);
          //console.log("startpoint h", startShape.name, height , taskSettings.height ,startShape.height ,ShapeMeasures.htmlHeight);
          if (endNode && endNodePosition) {
            let widthEndNode = 0;
            let heightEndNode = 0;
            if (getNodeInstance) {
              const endNodetaskSettings = FlowToCanvas.getTaskSettings(endNode.taskType);
              const nodeInstance = getNodeInstance(endNode, undefined, undefined, endNodetaskSettings);
              if (nodeInstance && nodeInstance.getWidth) {
                widthEndNode = nodeInstance.getWidth(endNode);
                heightEndNode = nodeInstance.getHeight(endNode);
              }
            }

            let result: any = undefined;
            if (startShape.curveMode === 'arc') {
              let resultPoints: any[] = [];
              const controlPoints = calculateLineControlPoints(
                newPosition.x + (width || endNode.width || ShapeMeasures.htmlWidth) / 2,
                newPosition.y + (height || 0) / 2,
                endNodePosition.x + (widthEndNode || endNode.width || ShapeMeasures.htmlWidth) / 2,
                endNodePosition.y + (heightEndNode || endNode.height || 0) / 2,
                ThumbPositionRelativeToNode.default,
                ThumbPositionRelativeToNode.default,
                {
                  curveMode: 'arc',
                },
              );
              const resultCount = cubicBezierAABB(
                newPosition.x + (width || startShape.width || ShapeMeasures.htmlWidth) / 2,
                newPosition.y + (height || 0) / 2,
                controlPoints.controlPointx1,
                controlPoints.controlPointy1,
                controlPoints.controlPointx2,
                controlPoints.controlPointy2,
                endNodePosition.x + (widthEndNode || endNode.width || ShapeMeasures.htmlWidth) / 2,
                endNodePosition.y + (heightEndNode || endNode.height || 0) / 2,

                newPosition.x - 0,
                newPosition.y - 0,
                newPosition.x + (width || startShape.width || ShapeMeasures.htmlWidth) + 0,
                newPosition.y + (height || 0) + 0,

                resultPoints,
              );

              if (resultPoints.length >= 1) {
                result = {
                  x: resultPoints[0],
                  y: resultPoints[1],
                };
              }

              if (result) {
                return {
                  x: result.x,
                  y: result.y,
                };
              }
            } else {
              /*const resultPointOnRect = pointOnRect(
                newPosition.x - 5,
                newPosition.y - 5,
                endNodePosition.x + (widthEndNode || endNode.width || ShapeMeasures.htmlWidth) / 2,
                endNodePosition.y + (heightEndNode || endNode.height || 0) / 2,
                newPosition.x + (width || endNode.width || ShapeMeasures.htmlWidth) + 5,
                newPosition.y + (height || 0) + 5,
                true,
              );
  
              if (resultPointOnRect) {
                result = {
                  x: resultPointOnRect.x,
                  y: resultPointOnRect.y,
                };
              }*/
            }
          }

          return {
            x: newPosition.x + (width || startShape.width || ShapeMeasures.htmlWidth) / 2,
            y: newPosition.y + height / 2,
          };
        }

        return {
          x: newPosition.x + (width || startShape.width || ShapeMeasures.htmlWidth),
          y: newPosition.y + height + 2,
        };
      }

      if (!!nodeAttachedToCenter) {
        return {
          x: newPosition.x + (width || startShape.width || ShapeMeasures.htmlWidth) / 2,
          y: newPosition.y + (height || 0) / 2,
        };
      }

      return {
        x: newPosition.x + (width || startShape.width || ShapeMeasures.htmlWidth),
        y: newPosition.y - (isEvent ? -32 + -4 - 32 - 8 - 12 : -8 + -4 - 32 - 8),
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
          x: newPosition.x,
          y: newPosition.y + ShapeMeasures.diamondSize / 2,
        };
      } else if (thumbPositionRelativeToNode == ThumbPositionRelativeToNode.right) {
        return {
          x: newPosition.x + ShapeMeasures.diamondSize,
          y: newPosition.y + ShapeMeasures.diamondSize / 2,
        };
      } else if (thumbPositionRelativeToNode == ThumbPositionRelativeToNode.top) {
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
        x: newPosition.x + ShapeMeasures.rectWidht + skewXOffset,
        y: newPosition.y + ShapeMeasures.rectHeight / 2 - 12 + (isEvent ? 4 + 8 + 24 + 36 : 4 + 8),
      };
    }
  }

  static getEndPointForLine(
    endNode,
    newPosition,
    startNode?: any,
    startNodePosition?: any,
    getNodeInstance?: any,
    thumbPositionRelativeToNode?: ThumbPositionRelativeToNode,
    altThumbPositions?: boolean,
  ) {
    const taskSettings = FlowToCanvas.getTaskSettings(endNode.taskType);
    const shapeType = FlowToCanvas.getShapeTypeUsingSettings(
      endNode.shapeType,
      endNode.taskType,
      endNode.isStartEnd,
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
      let height = 0;
      if (getNodeInstance && endNode) {
        const nodeInstance = getNodeInstance(endNode, undefined, undefined, taskSettings);
        if (nodeInstance && nodeInstance.getWidth) {
          width = nodeInstance.getWidth(endNode);
          height = nodeInstance.getHeight(endNode);
        }
      }

      const nodeAttachedToCenter = endNode.lineConnectionEndPoints === 'center-of-node';
      if (!!nodeAttachedToCenter) {
        if (startNode && startNodePosition) {
          let widthStartNode = 0;
          let heightStartNode = 0;
          if (getNodeInstance) {
            const nodeInstance = getNodeInstance(startNode, undefined, undefined, taskSettings);
            if (nodeInstance && nodeInstance.getWidth) {
              widthStartNode = nodeInstance.getWidth(startNode);
              heightStartNode = nodeInstance.getHeight(startNode);
            }
          }

          let result: any = undefined;
          if (startNode.curveMode === 'arc') {
            let resultPoints: any[] = [];
            const controlPoints = calculateLineControlPoints(
              startNodePosition.x + (widthStartNode || startNode.width || ShapeMeasures.htmlWidth) / 2,
              startNodePosition.y + (heightStartNode || startNode.height || 0) / 2,
              newPosition.x + (width || endNode.width || ShapeMeasures.htmlWidth) / 2,
              newPosition.y + (height || 0) / 2,
              ThumbPositionRelativeToNode.default,
              ThumbPositionRelativeToNode.default,
              {
                curveMode: 'arc',
              },
            );
            const resultCount = cubicBezierAABB(
              startNodePosition.x + (widthStartNode || startNode.width || ShapeMeasures.htmlWidth) / 2,
              startNodePosition.y + (heightStartNode || startNode.height || 0) / 2,
              controlPoints.controlPointx1,
              controlPoints.controlPointy1,
              controlPoints.controlPointx2,
              controlPoints.controlPointy2,
              newPosition.x + (width || endNode.width || ShapeMeasures.htmlWidth) / 2,
              newPosition.y + (height || 0) / 2,

              newPosition.x - 5,
              newPosition.y - 5,
              newPosition.x + (width || endNode.width || ShapeMeasures.htmlWidth) + 5,
              newPosition.y + (height || 0) + 5,

              resultPoints,
            );

            if (resultPoints.length >= 1) {
              result = {
                x: resultPoints[0],
                y: resultPoints[1],
              };
            }
          } else {
            const resultPointOnRect = pointOnRect(
              startNodePosition.x + (widthStartNode || startNode.width || ShapeMeasures.htmlWidth) / 2,
              startNodePosition.y + (heightStartNode || startNode.height || 0) / 2,
              newPosition.x - 5,
              newPosition.y - 5,
              newPosition.x + (width || endNode.width || ShapeMeasures.htmlWidth) + 5,
              newPosition.y + (height || 0) + 5,
              true,
            );

            if (resultPointOnRect) {
              result = {
                x: resultPointOnRect.x,
                y: resultPointOnRect.y,
              };
            }
          }

          if (result) {
            return {
              x: result.x,
              y: result.y,
            };
          }
        }
        return {
          x: newPosition.x + (width || endNode.width || ShapeMeasures.htmlWidth) / 2,
          y: newPosition.y + (height || 0) / 2,
        };
      }

      if (thumbPositionRelativeToNode == ThumbPositionRelativeToNode.top) {
        return {
          x: newPosition.x + (width || endNode.width || ShapeMeasures.htmlWidth) / 2,
          y: newPosition.y - 12,
        };
      }

      if (taskSettings.htmlPlugin === 'shapeNode') {
        height = (height || 0) / 2;
        return {
          x: newPosition.x - 8,
          y: newPosition.y + height + 2,
        };
      }

      return {
        x: newPosition.x - 8,
        y: newPosition.y + 40 + 12,
      };
    } else if (shapeType == 'Circle') {
      return {
        x: newPosition.x,
        y: newPosition.y + ShapeMeasures.circleSize / 2,
      };
    } else if (shapeType == 'Diamond') {
      if (thumbPositionRelativeToNode == ThumbPositionRelativeToNode.top) {
        return {
          x: newPosition.x + ShapeMeasures.diamondSize / 2,
          y: newPosition.y,
        };
      }
      return {
        x: newPosition.x - 6 - 2,
        y: newPosition.y + ShapeMeasures.diamondSize / 2,
      };
    } else {
      const nodeAttachedToCenter = endNode.lineConnectionEndPoints === 'center-of-node';
      if (!!nodeAttachedToCenter) {
        const resultPointOnRect = pointOnRect(
          startNodePosition.x + ShapeMeasures.rectWidht / 2 - 8,
          startNodePosition.y + ShapeMeasures.rectHeight / 2,
          newPosition.x - 8,
          newPosition.y,
          newPosition.x + ShapeMeasures.rectWidht + 8,
          newPosition.y + ShapeMeasures.rectHeight,
          true,
        );

        if (resultPointOnRect) {
          return {
            x: resultPointOnRect.x,
            y: resultPointOnRect.y,
          };
        }

        return {
          x: newPosition.x + ShapeMeasures.rectWidht / 2 - 8,
          y: newPosition.y + ShapeMeasures.rectHeight / 2 - 12 + (4 + 8),
        };
      }
      return {
        x: newPosition.x - 8,
        y: newPosition.y + ShapeMeasures.rectHeight / 2 - 12 + (4 + 8),
      };
    }
  }

  static getLinesForStartNodeFromCanvasFlow(flow: any, startNode: any, flowHashMap: any) {
    if (flow === undefined || startNode === undefined || flowHashMap == undefined) {
      return false;
    }
    const startConnection = flowHashMap.get(startNode.name);
    if (startConnection) {
      let nodes: any[] = [];
      flowHashMap.get(flow[startConnection.index].name).start.map((startIndex) => {
        let connection = flow[startIndex];
        if (connection) {
          nodes.push(connection);
        }
      });
      return nodes;
    }
    return false;
  }

  static getLinesForEndNodeFromCanvasFlow(flow: any, endNode: any, flowHashMap: any) {
    if (flow === undefined || endNode === undefined || flowHashMap == undefined) {
      return false;
    }

    const endConnection = flowHashMap.get(endNode.name);
    if (endConnection) {
      let nodes: any[] = [];
      flowHashMap.get(flow[endConnection.index].name).end.map((endIndex) => {
        let connection = flow[endIndex];
        if (connection) {
          nodes.push(connection);
        }
      });
      return nodes;
    }
    return false;
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
      } else if (positionRelativeToNode === ThumbPositionRelativeToNode.right) {
        return {
          x: position.x,
          y: position.y + offset * 24 - 12 + ShapeMeasures.diamondSize / 2,
        };
      } else if (positionRelativeToNode === ThumbPositionRelativeToNode.top) {
        return {
          x: position.x - ShapeMeasures.diamondSize / 2,
          y: position.y + offset * 24 - 12,
        };
      } else if (positionRelativeToNode === ThumbPositionRelativeToNode.bottom) {
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

  static getHasInputs(shapeType, taskSettings) {
    if (taskSettings) {
      if (!!taskSettings.isStartEnd) {
        return false;
      }
      const allowedInputs = taskSettings.constraints?.input?.allowedInputs ?? -1;
      return allowedInputs < 0 || allowedInputs > 0;
    }
    return true;
  }

  static getAllowedInputs(shapeType, taskSettings) {
    if (taskSettings) {
      if (!!taskSettings.isStartEnd) {
        return 0;
      }
      const allowedInputs = taskSettings.constraints?.input?.allowedInputs ?? -1;
      return allowedInputs;
    }
    return -1;
  }

  static canHaveInputs(shapeType, taskSettings, flow: any, node: any, flowHashMap: any) {
    if (flow === undefined || node === undefined || flowHashMap == undefined) {
      return false;
    }
    if (taskSettings) {
      if (!!taskSettings.isStartEnd) {
        return false;
      }
      const nodeMapped = flowHashMap.get(node.name);
      if (nodeMapped) {
        let currentInputs = flowHashMap.get(flow[nodeMapped.index].name).end.length;
        const allowedInputs = taskSettings.constraints?.input?.allowedInputs ?? -1;
        if (allowedInputs < 0) {
          return true;
        }

        return currentInputs < allowedInputs;
      }
    }
    return true;
  }

  static getHasOutputs(shapeType, taskSettings) {
    if (taskSettings) {
      const allowedOutputs = taskSettings.constraints?.output?.allowedOutputs ?? -1;
      return allowedOutputs < 0 || allowedOutputs > 0;
    }
    return true;
  }

  static getAllowedOutputs(shapeType, taskSettings) {
    if (taskSettings) {
      const allowedOutputs = taskSettings.constraints?.output?.allowedOutputs ?? -1;
      return allowedOutputs;
    }
    return -1;
  }

  static canHaveOutputs(shapeType, taskSettings, flow: any, node: any, flowHashMap: any) {
    if (flow === undefined || node === undefined || flowHashMap == undefined) {
      return false;
    }
    if (taskSettings) {
      const nodeMapped = flowHashMap.get(node.name);
      if (nodeMapped) {
        let currentOutputs = flowHashMap.get(flow[nodeMapped.index].name).start.length;
        const allowedOutputs = taskSettings.constraints?.output?.allowedOutputs ?? -1;
        if (allowedOutputs < 0) {
          return true;
        }

        return currentOutputs < allowedOutputs;
      }
    }
    return true;
  }

  static canNodesConnect(inputNode, outputNode) {
    if (!inputNode || !outputNode) {
      return true;
    }

    console.log('canNodesConnect', inputNode.taskType, outputNode.taskType);
    const settings = ShapeSettings.getShapeSettings(inputNode.taskType, inputNode);
    //const allowedInputTaskTypes = (settings as any)?.constraints?.input?.allowed ?? [];
    //const notAllowedInputTaskTypes = (settings as any)?.constraints?.input?.notAllowed ?? [];

    const allowedOutputTaskTypes = (settings as any)?.constraints?.output?.allowed ?? [];
    const notAllowedOutputTaskTypes = (settings as any)?.constraints?.output?.notAllowed ?? [];

    const settingsForNode = ShapeSettings.getShapeSettings(outputNode.taskType, outputNode);
    const allowedInputTaskTypesForOutputNode = (settingsForNode as any)?.constraints?.input?.allowed ?? [];
    const notAllowedInputTaskTypesForOutputNode = (settingsForNode as any)?.constraints?.input?.notAllowed ?? [];

    //const allowedOutputTaskTypesForOutputNode = (settingsForNode as any)?.constraints?.output?.allowed ?? [];
    //const notAllowedOutputTaskTypesForOutputNode = (settingsForNode as any)?.constraints?.output?.notAllowed ?? [];

    if (notAllowedOutputTaskTypes.indexOf(outputNode.taskType) >= 0) {
      return false;
    }
    if (allowedOutputTaskTypes.length > 0 && allowedOutputTaskTypes.indexOf(outputNode.taskType) < 0) {
      return false;
    }

    if (notAllowedInputTaskTypesForOutputNode.indexOf(inputNode.taskType) >= 0) {
      return false;
    }
    if (
      allowedInputTaskTypesForOutputNode.length > 0 &&
      allowedInputTaskTypesForOutputNode.indexOf(inputNode.taskType) < 0
    ) {
      return false;
    }

    return true;
  }
}
