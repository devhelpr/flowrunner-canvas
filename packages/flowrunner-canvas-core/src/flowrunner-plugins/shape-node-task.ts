import { FlowTask } from '@devhelpr/flowrunner';

export class ShapeNodeTask extends FlowTask {
  public execute(node: any, services: any) {
    return node.payload;
  }

  public getName() {
    return 'ShapeNodeTask';
  }
}
