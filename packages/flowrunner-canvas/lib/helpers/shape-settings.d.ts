export interface IShapeSettings {
    strokeColor: string;
    fillColor: string;
    fillSelectedColor: string;
    textColor: string;
    cornerRadius: number;
    isSkewed: boolean;
    subShapeType?: string;
    events?: any[];
    hasUI: boolean;
    hasConfigMenu?: boolean;
    icon?: string;
    uiComponent?: string;
    altThumbPositions?: number;
    background?: string;
}
export declare class ShapeSettings {
    static getShapeSettings(taskType: string, node: any): IShapeSettings;
}
