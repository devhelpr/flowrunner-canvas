import { FlowTask } from '@devhelpr/flowrunner';

export class RouteEndpointTask extends FlowTask {
  execute(node, service, callStack) {
    return node.payload;
  }

  getName() {
    return 'RouteEndpointTask';
  }
}
