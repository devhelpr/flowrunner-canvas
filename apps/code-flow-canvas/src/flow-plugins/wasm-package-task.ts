import { FlowTask } from '@devhelpr/flowrunner';
import { logPrintStringDefinition } from './wasm-import-sets/import-functions';

export class WebassemblyPackageTask extends FlowTask {
  public override execute(node: any, services: any) {
    const payload = { ...node.payload };
    // node.wasm.fileData
    return new Promise((resolve, reject) => {
      console.log('WebassemblyPackageTask', node);
      if (node.wasmPackage && node.wasmPackage && node.wasmPackage.fileData) {
        const wasmPackage = JSON.parse(atob(node.wasmPackage.fileData));
        console.log('wasmPackage', wasmPackage);
        if (!wasmPackage) {
          reject();
        }
        const binaryString = atob(wasmPackage.wasm);

        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const wasm = bytes.buffer;

        console.log(wasm);
        const mem = new WebAssembly.Memory({ initial: 1 });

        const importObject: any = {
          imports: {
            mem,
          },
        };

        let outputValues: number[] = [];

        const memoryContext: any = {
          callingContext: {
            context: 'hello from App',
            callback: (message: string) => {
              console.log('printString from App', message);
            },
            sendToOutput: (value: number) => {
              outputValues.push(value);
              return;
            },
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            sendMemoryToNode: () => {},
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            sendVariableToNode: () => {},
            flowNodes: [],
          },
        };

        if (wasmPackage.importSet === 'log_and_print') {
          logPrintStringDefinition.forEach((importFunction) => {
            importObject.imports[importFunction.functionName] = importFunction.handler.bind(memoryContext);
          });
        }

        const args: any = [];
        wasmPackage.parameters.forEach((parameter) => {
          args.push(payload[parameter.name] || parameter.defaultValue || 0);
        });
        WebAssembly.instantiate(wasm, importObject)
          .then((module) => {
            memoryContext.exports = module.instance.exports;
            console.log('WebassemblyPackageTask', ...args);
            outputValues = [];
            const result = (module.instance.exports as any).main(...args);
            payload.result = result;
            payload.outputValues = outputValues;
            resolve(payload);
          })
          .catch((err) => {
            console.log('err loading wasm', err);
            reject();
          });
      } else {
        resolve(payload);
      }
    });
  }

  public override getName() {
    return 'WebassemblyPackageTask';
  }
}
