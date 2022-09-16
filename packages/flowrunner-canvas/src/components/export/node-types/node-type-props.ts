import { INode } from '@devhelpr/flowrunner-canvas-core';

export interface INodeTypeProps {
  node: INode;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}
