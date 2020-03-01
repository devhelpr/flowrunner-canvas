const ctx: Worker = self as any;
import { FlowEventRunner, FlowTask, ObservableTask } from '@devhelpr/flowrunner';
import { Observable, Subject } from '@reactivex/rxjs';
import { ExpressionTask } from '@devhelpr/flowrunner-expression';

let flow : FlowEventRunner;
let observables = {};

export class PreviewTask extends FlowTask {
	public execute(node: any, services: any) {
		console.log("previewtask", node);		
		return true;
	}
	
	public getName() {
		return 'PreviewTask';
	}
	
}

export class OutputValueTask extends FlowTask {
	public execute(node: any, services: any) {
		if (node.propertyName && node.maxValue) {	
			node.payload = Object.assign({}, node.payload);
			let value = services.flowEventRunner.getPropertyFromNode(node.name, 
				node.propertyName) || node.startValue || 0;
			value += node.increment || 1;
			if (value > node.maxValue) {
				value = node.startValue;
			}	
			node.payload[node.propertyName] = value;
			services.flowEventRunner.setPropertyOnNode(node.name, 
				node.propertyName,
				value);
			
			return node.payload;
		}
		return node.payload;
	}
	
	public getName() {
		return 'OutputValueTask';
	}
}

export class SliderTask extends FlowTask {
	public execute(node: any, services: any) {
		
		if (node.propertyName) {	
			node.payload = Object.assign({}, node.payload);
			let value = node.defaultValue || 0;
			try {
				value = services.flowEventRunner.getPropertyFromNode(node.name, 
					node.propertyName);
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


export class DebugTask extends ObservableTask {
	public execute(node: any, services: any) {
		return super.execute({...node, sendNodeName: true} , services);
	}
	public getName() {
		return 'DebugTask';
	}
}

let timers : any = {};

export class TimerTask extends FlowTask {
		
	public execute(node: any, services: any) {
		if (timers[node.name]) {
			clearInterval(timers[node.name]);
			timers[node.name] = undefined;
		}
		if (node.interval) {
			let subject = new Subject<string>();
			const timer = setInterval(() => {
				subject.next(Object.assign({}, node.payload));
			}, node.interval);
			timers[node.name] = timer;
			return subject;
		}
		return false;
	}

	public getName() {
		return 'TimerTask';
	}
}

export class RandomTask extends ObservableTask {
		
	public execute(node: any, services: any) {
		node.payload = Object.assign({}, node.payload);
		let propertyName = "value";
		if (node.assignToProperty) {
			propertyName = node.assignToProperty;
		}
		if (node.maxValue) {
			node.payload[propertyName] = Math.round(Math.random() * node.maxValue);
		} else {
			node.payload[propertyName] = Math.random();
		}	
		return node.payload;
	}

	public getName() {
		return 'RandomTask';
	}
}

/*

ervices.flowEventRunner.setPropertyOnNode(node.nodeName, 
			node.modifyProperty,
			node.value);
*/

const onWorkerMessage = (event) => {

	// event.data contains event message data
	//console.log("event from flow", event);
	
	if (event && event.data) {
		if (event.data.command == "executeFlowNode" && event.data.nodeName) {
			if (!flow) {		
				return;
			}

			flow.executeNode(event.data.nodeName, event.data.payload || {}).then((result) => {
				console.log("result after executeNode", result);
			}).catch((error) => {
				console.log("executeNode failed", error);
			});
		} else
		if (event.data.command == "modifyFlowNode" && event.data.nodeName) {
			flow.setPropertyOnNode(event.data.nodeName, 
				event.data.propertyName,
				event.data.value);

			if (event.data.executeNode !== undefined && event.data.executeNode !== "") {
				flow.executeNode(event.data.executeNode, {}).then((result) => {
					console.log("result after modifyFlowNode executeNode", result);
				}).catch((error) => {
					console.log("modifyFlowNode executeNode failed", error);
				});
			}
		} else
		if (event.data.command == "pushFlowToFlowrunner") {
			(flow as any) = undefined;
			//console.log("pushFlowToFlowrunner", event.data);
			startFlow(
				{flow: event.data.flow}
			)
		} else
		if (event.data.command == "registerFlowNodeObserver") {
			if (observables[event.data.nodeName]) {
				(observables[event.data.nodeName] as any).unsubscribe();
			}
			const observable = flow.getObservableNode(event.data.nodeName);
			if (observable) {
				
				let subscribtion = observable.subscribe({
					next: (payload: any) => {
						//console.log("SendObservableNodePayload in registerFlowNodeObserver", payload);
						ctx.postMessage({
							"command" : "SendObservableNodePayload",
							"payload" : payload.payload,
							"nodeName" : payload.nodeName
						})
					}
				});
				observables[event.data.nodeName] = subscribtion;
			}
			
		}
	}
}

const startFlow = (flowPackage? : any) => {
	if (flow !== undefined) {
		for (var key of Object.keys(observables)) {
			observables[key].unsubscribe();
		}

		for (var timer of Object.keys(timers)) {
			clearInterval(timers[timer]);
		}
		timers = {};
		
		flow.destroyFlow();
		(flow as any) = undefined;
	}

	flow = new FlowEventRunner();
	flow.registerTask("PreviewTask", PreviewTask);
	flow.registerTask("DebugTask", DebugTask);
	flow.registerTask("SliderTask", SliderTask);
	flow.registerTask("TimerTask", TimerTask);
	flow.registerTask("RandomTask", RandomTask);
	flow.registerTask("ExpressionTask", ExpressionTask);
	flow.registerTask("OutputValueTask", OutputValueTask);

	let value : boolean = false;
	flow.start(flowPackage).then((services: any) => {
		//services.logMessage = (arg1, arg2) => { console.log(arg1,arg2 )};

		for (var key of Object.keys(observables)) {
			const observable = flow.getObservableNode(key);
			if (observable) {
				
				let subscribtion = observable.subscribe({
					next: (payload: any) => {
						//console.log("SendObservableNodePayload after start", key, payload);
						ctx.postMessage({
							"command" : "SendObservableNodePayload",
							"payload" : payload,
							"nodeName" : key
						})
					}
				});
				observables[key] = subscribtion;
			}
		}

		console.log("flow running");
	}).catch((error) => {
		console.log("error when starting flow", error);
	});

}

ctx.addEventListener("message", onWorkerMessage);

//ctx.postMessage({ foo: "foo" });
console.log("service-worker started");
