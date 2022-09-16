import {
  FlowToCanvas,
  IFlowrunnerConnector,
  IShapeSettings,
  ShapeMeasures,
  ShapeSettings,
} from '@devhelpr/flowrunner-canvas-core';

export interface INodeMeasure {
  width: number;
  height: number;
}

export const getWidthForHtmlNode = (
  node: any,
  getNodeInstance: (
    node: any,
    flowrunnerConnector?: IFlowrunnerConnector,
    flow?: any,
    taskSettings?: IShapeSettings,
  ) => any,
): INodeMeasure => {
  if (node) {
    if (getNodeInstance) {
      const shapeType = FlowToCanvas.getShapeType(node.shapeType, node.taskType, node.isStartEnd);
      if (shapeType === 'Html') {
        const settings = ShapeSettings.getShapeSettings(node.taskType, node);
        const instance = getNodeInstance(node, undefined, undefined, settings);
        if (instance && instance.getWidth && instance.getHeight) {
          let width = instance.getWidth(node);
          let height = instance.getHeight(node);
          let element = document.querySelector('#' + node.name + ' .html-plugin-node');
          if (element) {
            const elementWidth = element.clientWidth;
            if (elementWidth > width) {
              width = elementWidth;
            }

            const elementHeight = element.clientHeight;
            if (elementHeight > height) {
              height = elementHeight;
            }
          }
          return {
            width,
            height,
          };
        }
      } else {
        if (shapeType == 'Rect') {
          return { width: ShapeMeasures.rectWidht, height: ShapeMeasures.rectHeight };
        } else if (shapeType == 'Diamond') {
          return { width: ShapeMeasures.diamondSize, height: ShapeMeasures.diamondSize };
        }
      }
    }
  }
  return { width: 0, height: 0 };
};
