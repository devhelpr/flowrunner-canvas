import { FlowTask } from '@devhelpr/flowrunner';

export class GridEditTask extends FlowTask {
  public override execute(node: any, services: any) {
    if (node.propertyName) {
      node.payload = Object.assign({}, node.payload);
      let value = [];
      try {
        value = services.flowEventRunner.getPropertyFromNode(node.name, node.propertyName);
        if (value === undefined) {
          value = [];
        }
      } catch (err) {
        value = [];
      }
      node.payload[node.propertyName] = value;
      return node.payload;
    }

    return node.payload;
  }

  public override getName() {
    return 'GridEditTask';
  }
}
