export interface ShapeTypeProps {
  x: number;
  y: number;
  name: string;
  taskType: string;
  node: any;

  onDragStart: any;
  onDragMove: any;
  onDragEnd: any;
  onTouchStart: any;
  onTouchMove: any;
  onTouchEnd: any;

  onClickShape: any;
  isSelected: boolean;
  onMouseStart: any;
  onMouseMove: any;
  onMouseEnd: any;

  onMouseOver: any;
  onMouseOut: any;
  canvasHasSelectedNode: boolean;
  isConnectedToSelectedNode: boolean;
}

export interface LineTypeProps {
  xstart: number;
  ystart: number;
  xend: number;
  yend: number;
  onMouseOver: any;
  onMouseOut: any;
  onClickLine: any;
  isSelected: boolean;
  isAltColor?: boolean;
  isConnectionWithVariable?: boolean;
  isErrorColor?: boolean;
  isSuccessColor?: boolean;
  canvasHasSelectedNode: boolean;
  selectedNodeName: string;
  startNodeName: string;
  endNodeName: string;
}

export const shapeBackgroundColor: string = '#f2f2f2';
export const shapeSelectedBackgroundColor: string = '#a2a2a2';
