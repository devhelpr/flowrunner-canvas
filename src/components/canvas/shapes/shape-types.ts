import { IFlowrunnerConnector } from '../../../interfaces/IFlowrunnerConnector';

export interface ShapeTypeProps {
  x: number;
  y: number;
  name: string;
  taskType: string;
  node: any;
  flow: any;
  onDragStart: any;
  onDragMove: any;
  onDragEnd: any;
  onTouchStart: any;
  onTouchMove: any;
  onTouchEnd: any;

  nodeState: string;

  onClickShape: any;
  isSelected: boolean;
  onMouseStart: any;
  onMouseMove: any;
  onMouseEnd: any;
  onMouseLeave: any;

  onMouseOver: any;
  onMouseOut: any;

  onClickSetup : any;

  shapeRefs: any[];

  canvasHasSelectedNode: boolean;
  isConnectedToSelectedNode: boolean;
  getNodeInstance?: (node: any, flowrunnerConnector?: IFlowrunnerConnector, flow?: any, taskSettings?: any) => any;
  onRef?: (nodeName: string, ref: any) => void;

  onLineMouseOver: any;
  onLineMouseOut: any;
  onClickLine: any;
  selectedNode: any;

  canvasComponentInstance: any;
  touchedNodes: any;
}

export interface ThumbPosition {
  x: number;
  y: number;
}

export interface ThumbTypeProps {
  position: ThumbPosition;
  name: string;
  taskType: string;
  node: any;

  isSelected: boolean;
  shapeType?: string;

  onMouseConnectionStartOver?: any;
  onMouseConnectionStartOut?: any;
  onMouseConnectionStartStart?: any;
  onMouseConnectionStartMove?: any;
  onMouseConnectionStartEnd?: any;

  onMouseConnectionEndOver?: any;
  onMouseConnectionEndOut?: any;
  onMouseConnectionEndStart?: any;
  onMouseConnectionEndMove?: any;
  onMouseConnectionEndEnd?: any;

  onMouseConnectionEndLeave?: any;

  canvasHasSelectedNode: boolean;
  isConnectedToSelectedNode: boolean;

  getNodeInstance?: (node: any, flowrunnerConnector?: IFlowrunnerConnector, flow?: any, taskSettings?: any) => any;
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
  isEventNode?: boolean;
  canvasHasSelectedNode: boolean;
  selectedNodeName: string;
  startNodeName: string;
  endNodeName: string;
  opacity?: number;
  noMouseEvents: boolean;
  touchedNodes? : any;
  name?: string;
}

export const shapeBackgroundColor: string = '#f2f2f2';
export const shapeSelectedBackgroundColor: string = '#a2a2a2';
