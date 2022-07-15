import ejs from 'ejs';
import { FlowTask } from '@devhelpr/flowrunner';

export class HtmlViewTask extends FlowTask {
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
