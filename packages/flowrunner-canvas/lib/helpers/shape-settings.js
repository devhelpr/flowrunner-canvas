import { shapeBackgroundColor, shapeSelectedBackgroundColor } from '../components/canvas/shapes/shape-types';
import { getTaskConfigForTask } from '../config';
export class ShapeSettings {
    static getShapeSettings(taskType, node) {
        let settings = {
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
            }
            else {
                settings = { ...settings, ...taskTypeConfig, ...variableSettings };
            }
        }
        return settings;
    }
}
//# sourceMappingURL=shape-settings.js.map