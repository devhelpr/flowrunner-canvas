let FlowRunner = require('@devhelpr/flowrunner');

class RouteEndpointTask extends FlowRunner.FlowTask {
  execute(node, service, callStack) {
    return node.payload;
  }

  getName() {
    return 'RouteEndpointTask';
  }
}

module.exports = RouteEndpointTask;