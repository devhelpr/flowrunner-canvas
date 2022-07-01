import { ThumbPositionRelativeToNode } from '../components/canvas/shapes/shape-types';
import { IPositionContext } from '../components/contexts/position-context';
export declare class FlowToCanvas {
    static convertFlowPackageToCanvasFlow(flow: any, positionContext?: IPositionContext): any;
    static createFlowHashMap: (flow: any) => Map<any, any>;
    static getStartPointForLine(startShape: any, newPosition: any, endNode?: any, endNodePosition?: any, lineNodeToCheckIfIsEvent?: any, getNodeInstance?: any, thumbPositionRelativeToNode?: ThumbPositionRelativeToNode, altThumbPositions?: boolean): {
        x: any;
        y: any;
    };
    static getEndPointForLine(endNode: any, newPosition: any, startNode?: any, startNodePosition?: any, getNodeInstance?: any, thumbPositionRelativeToNode?: ThumbPositionRelativeToNode, altThumbPositions?: boolean): {
        x: any;
        y: any;
    };
    static getLinesForStartNodeFromCanvasFlow(flow: any, startNode: any, flowHashMap: any): false | any[];
    static getLinesForEndNodeFromCanvasFlow(flow: any, endNode: any, flowHashMap: any): false | any[];
    static getTaskSettings(taskType: any): any;
    static getShapeTypeUsingSettings(shapeType: any, taskType: any, isStartEnd: any, taskSettings: any): any;
    static getShapeType(shapeType: any, taskType: any, isStartEnd: any): any;
    static getThumbEndPosition(shapeType: string, position: any, offset?: any, positionRelativeToNode?: ThumbPositionRelativeToNode): {
        x: any;
        y: any;
    };
    static getThumbStartPosition(shapeType: string, position: any, offset: any, positionRelativeToNode?: ThumbPositionRelativeToNode): {
        x: any;
        y: any;
    };
    static getHasInputs(shapeType: any, taskSettings: any): boolean;
    static getAllowedInputs(shapeType: any, taskSettings: any): any;
    static canHaveInputs(shapeType: any, taskSettings: any, flow: any, node: any, flowHashMap: any): boolean;
    static getHasOutputs(shapeType: any, taskSettings: any): boolean;
    static getAllowedOutputs(shapeType: any, taskSettings: any): any;
    static canHaveOutputs(shapeType: any, taskSettings: any, flow: any, node: any, flowHashMap: any): boolean;
    static canNodesConnect(inputNode: any, outputNode: any): boolean;
}
