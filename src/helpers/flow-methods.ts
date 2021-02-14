import { FlowToCanvas } from '../helpers/flow-to-canvas';

import * as uuid from 'uuid';
import { BooleanLiteral } from '@babel/types';
const uuidV4 = uuid.v4;

export const getNewNode = (node: any, flow: any[]) => {

  let indexFromName = -1;
  let indexCharsFromName = "";
  let nonNumberFound : boolean = false;
  for (var index = 0; index < node.name.length; index++) {
    let c = node.name.charAt(node.name.length-1-index);
    if (!nonNumberFound && c >= '0' && c <= '9') {
      indexCharsFromName += c;
    } else {
      nonNumberFound = true;
    }
  }
  if (indexCharsFromName != "") {
    indexFromName = parseInt(indexCharsFromName) + 1;
    let orgName = node.name.substring(0, node.name.length - indexCharsFromName.length);

    let loop = 0;
    while (loop < flow.length) {
      if (flow[loop].name === orgName + indexFromName) {
        indexFromName++;
      }
      loop++;
    }

    const newNode = Object.assign({}, node);
    newNode.name = orgName + indexFromName;
    newNode.id = newNode.name;
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

export const getNewConnection = (nodeFrom, nodeTo, getNodeInstance?, isEvent?: any) => {
  const nodeFromPosition = FlowToCanvas.getStartPointForLine(
    nodeFrom,
    {
      x: nodeFrom.x,
      y: nodeFrom.y,
    },
    isEvent || {},
    getNodeInstance,
  );
  const nodeToPosition = FlowToCanvas.getEndPointForLine(
    nodeTo,
    {
      x: nodeTo.x,
      y: nodeTo.y,
    },
    {},
    getNodeInstance,
  );

  const connection = {
    name: 'connection-' + uuidV4(),
    taskType: 'connection',
    shapeType: 'Line',
    startshapeid: nodeFrom.name,
    endshapeid: nodeTo.name,
    xstart: nodeFromPosition.x,
    ystart: nodeFromPosition.y,
    xend: nodeToPosition.x,
    yend: nodeToPosition.y,
  };

  return connection;
};
