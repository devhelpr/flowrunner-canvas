import { FlowTask } from '@devhelpr/flowrunner';

export class ShapeNodeTask extends FlowTask {
  public override execute(node: any, services: any) {
    return node.payload;
  }

  public override getName() {
    return 'ShapeNodeTask';
  }
}
