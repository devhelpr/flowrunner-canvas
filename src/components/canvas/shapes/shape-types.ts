export interface ShapeTypeProps {
  x: number;
  y: number;
  name: string;
  taskType: string;
  onDragMove: any;
  onDragEnd: any;
  onClickShape: any;
  isSelected: boolean;
  onMouseOver: any;
  onMouseOut: any;
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
  isConnectionWithVariable? : boolean;
}

export const shapeBackgroundColor: string = '#f2f2f2';
export const shapeSelectedBackgroundColor: string = '#a2a2a2';
