import { shapeBackgroundColor, shapeSelectedBackgroundColor } from '../components/canvas/shapes/shape-types';
import { taskTypeConfig } from '../config';

export interface IShapeSettings {
  strokeColor: string;
  fillColor: string;
  fillSelectedColor: string;
  textColor: string;
  cornerRadius: number;
  isSkewed: boolean;
  subShapeType?: string;
}

export class ShapeSettings {
  static getShapeSettings(taskType: string, node: any): IShapeSettings {
    let settings: IShapeSettings = {
      strokeColor: '#000000',
      fillColor: shapeBackgroundColor,
      fillSelectedColor: shapeSelectedBackgroundColor,
      textColor: '#000000',
      cornerRadius: 0,
      isSkewed: false,
    };
    if (taskTypeConfig[taskType]) {
      let variableSettings = {};
      if (node && !!node.hasVariableAttached) {
        variableSettings = taskTypeConfig["_variable"];
      }
      if (node && node.objectSchema && taskTypeConfig[taskType][node.objectSchema]) {
        settings = { ...settings, ...taskTypeConfig[taskType], ...variableSettings, ...taskTypeConfig[taskType][node.objectSchema] };
      } else {
        settings = { ...settings, ...taskTypeConfig[taskType], ...variableSettings };
      }
    }
    return settings;
  }
}
