import { FlowTask } from '@devhelpr/flowrunner';

export class VariableTask extends FlowTask {
  public override execute(node: any, services: any) {
    return true;
  }

  public override getName() {
    return 'Variable';
  }
}
