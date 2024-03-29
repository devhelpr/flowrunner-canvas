import { ThumbPositionRelativeToNode } from './shape-types';

export interface INode {
  x: number;
  y: number;
  name: string;
  label?: string;
  taskType: 'connection' | 'Annotation' | string;
  shapeType: 'Line' | 'Rect' | 'Diamond' | 'Text' | 'Section' | 'Actor' | 'Html';
}

export interface IConnectionNode extends INode {
  startshapeid: string;
  endshapeid: string;
  xstart: number;
  ystart: number;
  xend: number;
  yend: number;
  flowPath?: string;
  followflow?: string;
  thumbPosition?: ThumbPositionRelativeToNode;
  thumbEndPosition?: ThumbPositionRelativeToNode;
}
