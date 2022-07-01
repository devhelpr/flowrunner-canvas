import { IFlowrunnerConnector } from '../../../interfaces/IFlowrunnerConnector';
import { IFlowState } from '../../../state/flow-state';
export interface ShapeTypeProps {
    x: number;
    y: number;
    name: string;
    taskType: string;
    node: any;
    hasTaskNameAsNodeTitle?: boolean;
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
    onClickSetup: any;
    shapeRefs: any[];
    canvasHasSelectedNode: boolean;
    isConnectedToSelectedNode: boolean;
    getNodeInstance?: (node: any, flowrunnerConnector?: IFlowrunnerConnector, flow?: any, taskSettings?: any) => any;
    onRef?: (nodeName: string, ref: any) => void;
    onLineMouseOver: any;
    onLineMouseOut: any;
    onClickLine: any;
    selectedNode: any;
    touchedNodes: any;
    useFlowStore: () => IFlowState;
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
}
export interface ThumbPosition {
    x: number;
    y: number;
}
export declare enum ThumbPositionRelativeToNode {
    default = 0,
    top = 1,
    bottom = 2,
    left = 3,
    right = 4
}
export declare enum ThumbFollowFlow {
    default = 0,
    happyFlow = 1,
    unhappyFlow = 2,
    event = 3
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
    followFlow?: ThumbFollowFlow;
    thumbPositionRelativeToNode?: ThumbPositionRelativeToNode;
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
    isConnectionWithFunction?: boolean;
    isErrorColor?: boolean;
    isSuccessColor?: boolean;
    isEventNode?: boolean;
    canvasHasSelectedNode: boolean;
    selectedNodeName: string;
    startNodeName: string;
    endNodeName: string;
    opacity?: number;
    noMouseEvents: boolean;
    touchedNodes?: any;
    name?: string;
    thumbPosition?: ThumbPositionRelativeToNode;
    thumbEndPosition?: ThumbPositionRelativeToNode;
    isNodeConnectorHelper?: boolean;
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
    onMouseStart: any;
    onMouseMove: any;
    onMouseEnd: any;
    hasStartThumb?: boolean;
    hasEndThumb?: boolean;
    lineNode?: any;
    shapeRefs?: any[];
    getNodeInstance?: (node: any, flowrunnerConnector?: IFlowrunnerConnector, flow?: any, taskSettings?: any) => any;
}
export declare const shapeBackgroundColor: string;
export declare const shapeSelectedBackgroundColor: string;
export declare enum ModifyShapeEnum {
    SetXY = 1,
    SetPoints = 2,
    GetXY = 3,
    GetShapeType = 4,
    SetState = 5,
    SetOpacity = 6
}
export declare enum ShapeStateEnum {
    Default = 1,
    Touched = 2,
    Selected = 3,
    Error = 4,
    Ok = 5
}
