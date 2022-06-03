import { FlowTask } from '@devhelpr/flowrunner';

export class TestTask extends FlowTask {
  public execute(node: any, services: any) {
    return node.payload;
  }

  public getName() {
    return 'TestTask';
  }
}
