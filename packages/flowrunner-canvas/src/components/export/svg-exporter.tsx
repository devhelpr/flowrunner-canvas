import * as React from 'react';
import { INode, IConnectionNode, IPositionContextUtils, IFlowrunnerConnector } from '@devhelpr/flowrunner-canvas-core';
import { renderToString } from 'react-dom/server';
import { getWidthForHtmlNode } from '../canvas/utils';
import { getNode } from './node-types';
import { Line } from './node-types/line';

export interface INodeHelper {
  index: number;
  width: number;
  height: number;
}

interface INodePosition {
  x: number;
  y: number;
}

export const createFlowAsSvg = (
  flow: INode[],
  positionContext: IPositionContextUtils,
  getNodeInstance: (node: any, flowrunnerConnector?: IFlowrunnerConnector, flow?: any, taskSettings?: any) => any,
  flowrunnerConnector: IFlowrunnerConnector,
) => {
  let minX = 0;
  let minY = 0;
  let maxX = 0;
  let maxY = 0;

  let maxWidth = 0;
  let maxHeight = 0;

  let flowIndexByName: { [key: string]: INodeHelper } = {};

  let isMinMaxInitialized = false;
  let loop = 0;
  while (loop < flow.length) {
    const flowNode = flow[loop];

    if (flowNode.taskType !== 'connection') {
      const position = (positionContext.getPosition(flowNode.name) || flowNode) as unknown as INodePosition;
      const { width, height } = getWidthForHtmlNode(flowNode, getNodeInstance);
      if (!isMinMaxInitialized) {
        minX = position.x;
        minY = position.y;
        maxX = position.x;
        maxY = flowNode.y;
        maxWidth = width || 300;
        maxHeight = height || 300;
        isMinMaxInitialized = true;
      } else {
        if (position.x < minX) {
          minX = position.x;
        }
        if (flowNode.y < minY) {
          minY = position.y;
        }

        if (position.x > maxX) {
          maxX = position.x;
        }
        if (position.y > maxY) {
          maxY = position.y;
        }

        if (width > maxWidth) {
          maxWidth = width;
        }
        if (height > maxHeight) {
          maxHeight = height;
        }
      }
      flowIndexByName[flowNode.name] = {
        index: loop,
        width,
        height,
      };
    } else {
      flowIndexByName[flowNode.name] = {
        index: loop,
        width: 0,
        height: 0,
      };
    }

    loop++;
  }

  const linesAsSvg = (
    <>
      {flow
        .filter((node) => node.taskType === 'connection')
        .map((node) => {
          const connectionNode = node as unknown as IConnectionNode;
          if (connectionNode.startshapeid && connectionNode.endshapeid) {
            const start = flowIndexByName[connectionNode.startshapeid];
            const end = flowIndexByName[connectionNode.endshapeid];
            if (start.index >= 0 && end.index >= 0) {
              const startNode = flow[start.index];
              const endNode = flow[end.index];
              return (
                <Line
                  connectionNode={connectionNode}
                  startNode={startNode}
                  endNode={endNode}
                  startWidth={start.width}
                  startHeight={start.height}
                  endWidth={end.width}
                  endHeight={end.height}
                  minX={minX}
                  minY={minY}
                  maxX={maxX}
                  maxY={maxY}
                />
              );
            }
          }
        })}
    </>
  );

  const nodesAsSvg = (
    <>
      {flow
        .filter((node) => node.taskType !== 'connection' && node.taskType !== 'Annotation')
        .map((node) => {
          const nodeHelper = flowIndexByName[node.name];
          return <>{getNode(node, minX, minY, maxX, maxY, nodeHelper.width, nodeHelper.height)}</>;
        })}
    </>
  );

  const output = renderToString(
    <svg
      viewBox={`0 0 ${maxWidth + maxX - minX + 10} ${maxHeight + maxY - minY + 10}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {linesAsSvg}
      {nodesAsSvg}
    </svg>,
  );
  return output;
};
