import { ThumbPositionRelativeToNode } from '../components/canvas/shapes/shape-types';
export declare const getNewNode: (node: any, flow: any[], useNameFromNode?: boolean | undefined) => any;
export declare const getNewConnection: (nodeFrom: any, nodeTo: any, getNodeInstance?: any, isEvent?: any, thumbPositionRelativeToNode?: ThumbPositionRelativeToNode | undefined, positionToX?: number | undefined, positionToY?: number | undefined) => {
    name: string;
    taskType: string;
    shapeType: string;
    startshapeid: any;
    endshapeid: any;
    xstart: any;
    ystart: any;
    xend: number;
    yend: number;
};
