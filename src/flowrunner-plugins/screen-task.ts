
import { FlowTask } from '@devhelpr/flowrunner';

export class ScreenTask extends FlowTask {
	public execute(node: any, services: any) {
	  console.log('ScreenTask', node);
	  try {
		services.workerContext.postMessage({
			command: 'SendScreen',
			payload: {...(node.payload.titleBar || node.titleBar  || {})}
		});
		return node.payload;
	  } catch (err) {
		console.log('ScreenTask error', err);
	  }
	  return false;
	}
  
	public getName() {
	  return 'ScreenTask';
	}
  }