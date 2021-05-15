let ejs = require('ejs');
let FlowRunner = require('@devhelpr/flowrunner');

class HtmlViewTask extends FlowRunner.FlowTask {
  execute(node, service, callStack) {
	if (callStack && callStack.response) {
		try {
			callStack.response.send(ejs.render(node.view, node.payload, {async:false}));
		} catch (err) {
			console.log(`Exception in HtmlViewTask ${err}`);
			return false;
		}
	}
    return node.payload;
  }

  getName() {
    return 'HtmlViewTask';
  }
}

module.exports = HtmlViewTask;