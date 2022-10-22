import { IShapeSettings, replaceValuesExpressions } from '@devhelpr/flowrunner-canvas-core';

export const getLabelForNode = (node: any, settings: IShapeSettings) => {
  let labelText = '';
  if (node) {
    labelText = node && node.label ? node.label : node.name;
  }
  if (settings && (settings as any).label) {
    if (typeof (settings as any).label === 'function') {
      labelText = replaceValuesExpressions((settings as any).label(node), node, '-');
    } else {
      labelText = replaceValuesExpressions((settings as any).label, node, '-');
    }
  }
  return labelText;
};
