import { IFlowrunnerConnector } from '../interfaces/IFlowrunnerConnector';
import { IWorker } from '../interfaces/IWorker';

export class FlowConnector implements IFlowrunnerConnector {

	worker? : IWorker = undefined;
	observables = {};

	registerWorker(worker : IWorker) {
		this.worker = worker;
		worker.postMessage({ a: 1 });
		
		worker.addEventListener("message", this.onMessage);		
	}

	onMessage = (event : any) => {
		//console.log("event from worker", event);
		if (event && event.data) {
			if (event.data.command == "SendObservableNodePayload") {

				// TODO : de eerst keer gaat dit niet goed...

				//console.log("SendObservableNodePayload", event.data);
				if (event.data.payload &&
					event.data.payload.nodeName && 
					this.observables[event.data.payload.nodeName]) {
					this.observables[event.data.payload.nodeName](event.data.payload.payload);
				} else // TODO : FIX THESE TWO ... should be the same...
				if (event.data.nodeName && this.observables[event.data.nodeName]) {
					this.observables[event.data.nodeName](event.data.payload);
				}
			}
		}
		return;
	}

	registerFlowNodeObserver = (nodeName: string, callback : (payload : any) => void) => {
		//console.log("registerFlowNodeObserver", nodeName);
		this.observables[nodeName] = callback;
		if (this.worker) {
			this.worker.postMessage({  
				command : "registerFlowNodeObserver",
				nodeName : nodeName
			});
		}
	}

	unregisterFlowNodeObserver = (nodeName) => {
		this.observables[nodeName] = undefined;
		delete this.observables[nodeName];
	}
	
	updateFlowNode = () => {

	}
	pushFlowToFlowrunner = (flow : any) => {
		if (this.worker) {
			this.worker.postMessage({  
				command : "pushFlowToFlowrunner",
				flow : flow
			});
		}
	}
	executeFlowNode = (nodeName : string, payload: any) => {
		if (this.worker) {
			this.worker.postMessage({  
				command : "executeFlowNode",
				nodeName : nodeName,
				payload: payload
			});
		}
	}

	modifyFlowNode = (nodeName : string, propertyName: string, value : any, executeNode: string) => {
		if (this.worker) {
			this.worker.postMessage({  
				command : "modifyFlowNode",
				nodeName : nodeName,
				propertyName: propertyName,
				value: value,
				executeNode: executeNode
			});
		}
	}
}