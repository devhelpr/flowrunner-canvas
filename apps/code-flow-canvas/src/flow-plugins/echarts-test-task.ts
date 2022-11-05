import { FlowTask } from '@devhelpr/flowrunner';
import { DebugTask } from 'packages/flowrunner-canvas-core/src/flowrunner-plugins/debug-task';

export class EChartsTestTask extends DebugTask {
  public override execute(node: any, services: any) {
    return super.execute(node, services);
  }

  public override getName() {
    return 'EChartsTestTask';
  }
}
