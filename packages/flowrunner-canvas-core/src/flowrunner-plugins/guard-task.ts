import { FlowTask } from '@devhelpr/flowrunner';

export class GuardTask extends FlowTask {
  public override execute(node: any, services: any) {
    return false;
  }

  public override getName() {
    return 'Guard';
  }
}
