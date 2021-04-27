import { FlowTask } from '@devhelpr/flowrunner';
import { getWebassembly } from './components/webassembly';

export class PrototypeTask extends FlowTask {
  
  wasm : any;
  input : string = "";

  public execute(node: any, services: any) {
    if (node.prototype == "webassembly-test") {
      return new Promise(async (resolve, reject) => {
        if (!this.wasm || this.input === "" || this.input !== node.input) {
          this.input = node.input;
          getWebassembly(node.input, 256, 256).then((data) => {
            console.log("getWebassembly initial get"); // waarom komt ie hier 256  keer? 16x16 hmmm
            this.wasm = data;
            if (data && (data as any).mainFunction) {
              const payload = {...node.payload};
              try {
                const result = (data as any).mainFunction(payload["x"] || 0,payload["y"] || 0,payload["i"] || 0,payload["t"] || 0);
                payload[node.outputProperty || "result"] = result;
                //console.log("getWebassembly payload", payload);
                resolve(payload);
              } catch(err) {
                console.log("getWebassembly catch err" , err);
                reject();        
              }
           } else {      
              console.log("getWebasm catch 1");
              reject();
           }
          }).catch(() => {
            console.log("getWebasm catch 2");
            reject();
          });
        } else {
          if (this.wasm && (this.wasm as any).mainFunction) {
            const payload = {...node.payload};
            const result = (this.wasm as any).mainFunction(payload["x"] || 0,payload["y"] || 0,payload["i"] || 0,payload["t"] || 0, 256, 256);
            payload[node.outputProperty || "result"] = result;
            //console.log("getWebassembly payload 2", payload);
            resolve(payload)
         } else {      
            console.log("getWebasm catch 3");
            reject();
         }
        }

      });
    }
    return node.payload;
  }

  public getName() {
    return 'PrototypeTask';
  }
}
