import { shapeBackgroundColor, shapeSelectedBackgroundColor } from '../interfaces/shape-types';
import { getTaskConfigForTask } from '../config';

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

export class ShapeSettings {
  static getShapeSettings(taskType: string, node: any): IShapeSettings {
    let settings: IShapeSettings = {
      strokeColor: '#000000',
      fillColor: shapeBackgroundColor,
      fillSelectedColor: shapeSelectedBackgroundColor,
      textColor: '#000000',
      cornerRadius: 0,
      isSkewed: false,
      hasUI: false,
    };
    const taskTypeConfig = getTaskConfigForTask(taskType);
    if (taskTypeConfig) {
      let variableSettings = {};
      if (node && !!node.hasVariableAttached) {
        variableSettings = taskTypeConfig['_variable'];
      }
      if (node && node.objectSchema && taskTypeConfig[node.objectSchema]) {
        settings = {
          ...settings,
          ...taskTypeConfig,
          ...variableSettings,
          ...taskTypeConfig[node.objectSchema],
        };
      } else {
        settings = { ...settings, ...taskTypeConfig, ...variableSettings };
      }
    }
    return settings;
  }
}
