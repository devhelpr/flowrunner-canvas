import { FlowTask } from '@devhelpr/flowrunner';

export class SliderTask extends FlowTask {
	public execute(node: any, services: any) {
	  if (node.propertyName) {
		node.payload = Object.assign({}, node.payload);
		let value = node.defaultValue || 0;
		try {
		  value = services.flowEventRunner.getPropertyFromNode(node.name, node.propertyName);
		  if (value === undefined || isNaN(value)) {
			value = node.defaultValue || 0;
		  }
		} catch (err) {
		  value = node.defaultValue || 0;
		}
		node.payload[node.propertyName] = value;
		return node.payload;
	  }
  
	  return node.payload;
	}
  
	public getName() {
	  return 'SliderTask';
	}
  }