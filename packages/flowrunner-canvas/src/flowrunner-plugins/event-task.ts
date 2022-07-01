import { FlowTask } from '@devhelpr/flowrunner';

export class EventTask extends FlowTask {
  public execute(node: any, services: any) {
    return false;
  }

  public getName() {
    return 'Event';
  }
}
