export interface INode {
  x: number;
  y: number;
  name: string;
  label?: string;
  taskType: 'connection' | 'Annotation' | string;
  shapeType: 'Line' | 'Rect' | 'Diamond' | 'Text' | 'Section' | 'Html';
}

export interface IConnectionNode extends INode {
  startshapeid: string;
  endshapeid: string;
  xstart: number;
  ystart: number;
  xend: number;
  yend: number;
  flowPath?: string;
}
