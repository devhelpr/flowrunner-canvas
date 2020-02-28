const ctx: Worker = self as any;
import { FlowEventRunner, FlowTask, ObservableTask } from '@devhelpr/flowrunner';
import { Observable, Subject } from '@reactivex/rxjs';

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
		if (node.maxValue) {
			node.payload.value = Math.round(Math.random() * node.maxValue);
		} else {
			node.payload.value = Math.random();
		}	
		console.log("random", node.payload);
		return node.payload;
	}

	public getName() {
		return 'RandomTask';
	}
}

const onWorkerMessage = (event) => {

	// event.data contains event message data
	console.log("event from flow", event);
	
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
		if (event.data.command == "pushFlowToFlowrunner") {
			(flow as any) = undefined;
			console.log("pushFlowToFlowrunner", event.data);
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
						console.log("SendObservableNodePayload in registerFlowNodeObserver", payload);
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
	flow.registerTask("TimerTask", TimerTask);
	flow.registerTask("RandomTask", RandomTask);

	let value : boolean = false;
	flow.start(flowPackage).then((services: any) => {
		services.logMessage = (arg1, arg2) => { console.log(arg1,arg2 )};


		for (var key of Object.keys(observables)) {
			const observable = flow.getObservableNode(key);
			if (observable) {
				
				let subscribtion = observable.subscribe({
					next: (payload: any) => {
						console.log("SendObservableNodePayload after start", key, payload);
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
