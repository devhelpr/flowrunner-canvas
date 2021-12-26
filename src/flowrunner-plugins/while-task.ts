import { FlowTask } from '@devhelpr/flowrunner';

export class WhileTask extends FlowTask {
  public execute(node: any, services: any) {
    return node.payload;
  }

  public getName() {
    return 'WhileTask';
  }
}
