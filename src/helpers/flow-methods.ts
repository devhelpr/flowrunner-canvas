import { FlowToCanvas } from '../helpers/flow-to-canvas';

import * as uuid from 'uuid';
const uuidV4 = uuid.v4;

export const getNewNode = (node: any, flow: any[]) => {
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

export const getNewConnection = (nodeFrom, nodeTo) => {
  const nodeFromPosition = FlowToCanvas.getStartPointForLine(nodeFrom, {
    x: nodeFrom.x,
    y: nodeFrom.y,
  });
  const nodeToPosition = FlowToCanvas.getEndPointForLine(nodeTo, {
    x: nodeTo.x,
    y: nodeTo.y,
  });

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
