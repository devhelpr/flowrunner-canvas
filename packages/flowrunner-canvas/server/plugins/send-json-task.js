let FlowRunner = require('@devhelpr/flowrunner');

class SendJsonTask extends FlowRunner.FlowTask {
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

module.exports = SendJsonTask;