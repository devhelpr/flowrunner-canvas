import { DebugTask } from './debug-task';

export class DataTableTask extends DebugTask {
  public override execute(node: any, services: any) {
    return super.execute(node, services);
  }

  public override getName() {
    return 'DataTableTask';
  }
}
