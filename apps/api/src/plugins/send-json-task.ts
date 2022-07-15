import { FlowTask } from '@devhelpr/flowrunner';

export class SendJsonTask extends FlowTask {
  execute(node, services, callStack) {
    if (callStack && callStack.response) {
		callStack.response.send(JSON.stringify(node.payload));
	}
    return node.payload;
  }

  getName() {
    return 'SendJsonTask';
  }
}
