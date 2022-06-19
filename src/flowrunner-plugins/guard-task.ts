import { FlowTask } from '@devhelpr/flowrunner';

export class GuardTask extends FlowTask {
  public execute(node: any, services: any) {
    return false;
  }

  public getName() {
    return 'Guard';
  }
}
