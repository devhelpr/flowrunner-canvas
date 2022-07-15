import { FlowTask } from '@devhelpr/flowrunner';

export class OnStartFlowTask extends FlowTask {
  public override execute(node: any, services: any) {
    return true;
  }

  public override getName() {
    return 'OnStartFlow';
  }

  public isStartingOnInitFlow() {
    return true;
  }
}
