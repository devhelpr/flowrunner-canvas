import { FlowTask } from '@devhelpr/flowrunner';

export class StateTask extends FlowTask {
  public execute(node: any, services: any) {
    return false;
  }

  public getName() {
    return 'State';
  }
}
