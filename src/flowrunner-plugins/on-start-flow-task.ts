import { FlowTask } from '@devhelpr/flowrunner';

export class OnStartFlowTask extends FlowTask {
  public execute(node: any, services: any) {
    return true;
  }

  public getName() {
    return 'OnStartFlow';
  }

  public isStartingOnInitFlow() {
    return true;
  }
}
