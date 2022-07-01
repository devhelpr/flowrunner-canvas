import { FlowTask } from '@devhelpr/flowrunner';

export class StartStateTask extends FlowTask {
  public execute(node: any, services: any) {
    return false;
  }

  public getName() {
    return 'StartState';
  }
}
