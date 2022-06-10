import { FlowToCanvas } from '../helpers/flow-to-canvas';
import { ThumbPositionRelativeToNode } from '../components/canvas/shapes/shape-types';

import * as uuid from 'uuid';
const uuidV4 = uuid.v4;

export const getNewNode = (node: any, flow: any[], useNameFromNode?: boolean) => {
  let indexFromName = -1;
  let indexCharsFromName = '';
  let nonNumberFound: boolean = false;
  for (var index = 0; index < node.name.length; index++) {
    let c = node.name.charAt(node.name.length - 1 - index);
    if (!nonNumberFound && c >= '0' && c <= '9') {
      indexCharsFromName = c + indexCharsFromName;
    } else {
      nonNumberFound = true;
    }
  }
  if (indexCharsFromName != '') {
    indexFromName = parseInt(indexCharsFromName) + 1;
    let orgName = node.name.substring(0, node.name.length - indexCharsFromName.length);

    let hasChanged = true;
    while (hasChanged) {
      hasChanged = false;
      let loop = 0;
      while (loop < flow.length) {
        if (flow[loop].name === orgName + indexFromName) {
          indexFromName++;
          hasChanged = true;
        }
        loop++;
      }
    }

    const newNode = Object.assign({}, node);
    if (useNameFromNode === undefined || useNameFromNode === false) {
      newNode.name = orgName + indexFromName;
      newNode.id = newNode.name;
    }
    return newNode;
  }

  let loop = 0;
  let max: any;
  while (loop < flow.length) {
    if (flow[loop].name.indexOf(node.name) === 0) {
      if (flow[loop].name === node.name) {
        if (max === undefined) {
          max = 0;
        } else {
          max = max + 1;
        }
      } else {
        const last = flow[loop].name.substring(node.name.length);
        const number = parseInt(last);
        if (!isNaN(number)) {
          if (max === undefined) {
            max = number;
          } else if (number > max) {
            max = number;
          }
        }
      }
    }
    loop++;
  }

  const newNode = Object.assign({}, node);
  if (max !== undefined) {
    newNode.name = newNode.name + (max + 1);
    newNode.id = newNode.name;
  }
  return newNode;
};

export const getNewConnection = (
  nodeFrom,
  nodeTo,
  getNodeInstance?,
  isEvent?: any,
  thumbPositionRelativeToNode?: ThumbPositionRelativeToNode,
  positionToX?: number,
  positionToY?: number,
) => {
  const nodeFromPosition = FlowToCanvas.getStartPointForLine(
    nodeFrom,
    {
      x: nodeFrom.x,
      y: nodeFrom.y,
    },
    isEvent || {},
    getNodeInstance,
    thumbPositionRelativeToNode,
  );
  let nodeToPosition = {
    x: 0,
    y: 0,
  };
  let nodeToName: any = undefined;
  if (nodeTo) {
    nodeToPosition = FlowToCanvas.getEndPointForLine(
      nodeTo,
      {
        x: nodeTo.x,
        y: nodeTo.y,
      },
      nodeFrom, undefined,
      getNodeInstance,
    );
    nodeToName = nodeTo.name;
  } else {
    nodeToPosition.x = positionToX || 0;
    nodeToPosition.y = positionToY || 0;
  }

  const connection = {
    name: 'connection-' + uuidV4(),
    taskType: 'connection',
    shapeType: 'Line',
    startshapeid: nodeFrom.name,
    endshapeid: nodeToName,
    xstart: nodeFromPosition.x,
    ystart: nodeFromPosition.y,
    xend: nodeToPosition.x,
    yend: nodeToPosition.y,
  };

  return connection;
};
