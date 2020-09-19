
import { FlowTask } from '@devhelpr/flowrunner';
import { WasmFlowLoader } from './components/wasm-flow-loader';

export class RunWasmFlowTask extends FlowTask {
	webassemblyFlowrunner : any = undefined;

	public execute(node: any, services: any) {
		if (!node.flow) {
			return false;
		}
		try {
			if (this.webassemblyFlowrunner === undefined) {
				if (node.flowId) {
					const loader = new WasmFlowLoader();
					return new Promise((resolve, reject) => {
							loader.getFlow(node.flowId).then((flow) => {
							console.log("RunWasmFlowTask", node.name, flow);

							const webAssembly = services.getWebAssembly();
							this.webassemblyFlowrunner = webAssembly.Flowrunner.new(`[]`,`{"flow":${JSON.stringify(flow)}}
							`);

							let payload = Object.assign({},
								node.payload,
								this.webassemblyFlowrunner.convert(JSON.stringify({}))
							);	
							resolve(payload);
						}).catch(() => {
							reject();
						});
					});
				}
				/*const webAssembly = services.getWebAssembly();
				this.webassemblyFlowrunner = webAssembly.Flowrunner.new(`[]`,
					`{"flow":${JSON.stringify(node.flow)}}`);
				*/
			} else {
				let payload = Object.assign({},
					node.payload,
					this.webassemblyFlowrunner.convert(JSON.stringify({}))
				);
				return payload;	
			}
			
			//console.log("payload" , payload);
			//return false;
		} catch(err) {
			console.log("RunWasmFlowTask error" , err);
			return false;
		}	
	}

	public getName() {
		return 'RunWasmFlowTask';
	}

}