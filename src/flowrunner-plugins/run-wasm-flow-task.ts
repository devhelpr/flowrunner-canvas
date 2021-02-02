import { FlowTask } from '@devhelpr/flowrunner';
import { FlowLoader } from './components/flow-loader';

export class RunWasmFlowTask extends FlowTask {
  webassemblyFlowrunner: any = undefined;

  public execute(node: any, services: any) {
    try {
      if (this.webassemblyFlowrunner === undefined) {
        if (node.flowId) {
          const loader = new FlowLoader();
          return new Promise((resolve, reject) => {
            loader
              .getFlow(node.flowId)
              .then(flow => {
                console.log('RunWasmFlowTask', node.name, flow);
                try {
                  const webAssembly = services.getWebAssembly();
                  this.webassemblyFlowrunner = webAssembly.Flowrunner.new(
                    `[]`,
                    `{"flow":${JSON.stringify(flow)}}
                    `,
                  );

                  let payload = Object.assign({}, node.payload, this.webassemblyFlowrunner.convert(JSON.stringify({})));
                  console.log('wasm return payload', payload);
                  resolve(payload);
                } catch (err) {
                  conso.log('wasm error', err);
                  reject();
                }
              })
              .catch(() => {
                console.log('wasm rejected');
                reject();
              });
          });
        }
        /*const webAssembly = services.getWebAssembly();
				this.webassemblyFlowrunner = webAssembly.Flowrunner.new(`[]`,
					`{"flow":${JSON.stringify(node.flow)}}`);
				*/
      } else {
        let payload = Object.assign({}, node.payload, this.webassemblyFlowrunner.convert(JSON.stringify({})));
        return payload;
      }

      //console.log("payload" , payload);
      //return false;
    } catch (err) {
      console.log('RunWasmFlowTask error', err);
      return false;
    }
  }

  public getName() {
    return 'RunWasmFlowTask';
  }
}
