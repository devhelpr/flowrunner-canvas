import { FlowTask } from '@devhelpr/flowrunner';
import { logPrintStringDefinition } from './wasm-import-sets/import-functions';

export class WebassemblyPackageTask extends FlowTask {
  webassemblyModule: any = undefined;
  wasmPackageCacheFile: any = undefined;
  wasmPackage: any = undefined;

  outputValues: number[] = [];
  public override execute(node: any, services: any) {
    const payload = { ...node.payload };

    const memoryContext: any = {
      callingContext: {
        context: 'hello from App',
        callback: (message: string) => {
          console.log('printString from App', message);
        },
        sendToOutput: (value: number) => {
          //console.log('sendToOutput from App', value, this.outputValues, this);
          this.outputValues.push(value);
          return;
        },
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        sendMemoryToNode: () => {},
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        sendVariableToNode: () => {},
        flowNodes: [],
      },
    };

    // node.wasm.fileData
    return new Promise((resolve, reject) => {
      //console.log('WebassemblyPackageTask', node);
      if (node.wasmPackage && node.wasmPackage && node.wasmPackage.fileData) {
        if (!this.webassemblyModule || this.wasmPackageCacheFile !== node.wasmPackage.fileData) {
          this.wasmPackage = JSON.parse(atob(node.wasmPackage.fileData));
          //console.log('wasmPackage', this.wasmPackage);
          if (!this.wasmPackage) {
            reject();
          }
          this.wasmPackageCacheFile = node.wasmPackage.fileData;
          const binaryString = atob(this.wasmPackage.wasm);

          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const wasm = bytes.buffer;

          //console.log(wasm);
          const mem = new WebAssembly.Memory({ initial: 1 });

          const importObject: any = {
            imports: {
              mem,
            },
          };

          if (this.wasmPackage.importSet === 'log_and_print') {
            logPrintStringDefinition.forEach((importFunction) => {
              importObject.imports[importFunction.functionName] = importFunction.handler.bind(memoryContext);
            });
          }

          const args: any = [];
          this.wasmPackage.parameters.forEach((parameter) => {
            args.push(payload[parameter.name] || parameter.defaultValue || 0);
          });
          //console.log('WebAssembly.instantiate before');
          try {
            WebAssembly.instantiate(wasm, importObject)
              .then((module) => {
                this.webassemblyModule = module;
                memoryContext.exports = module.instance.exports;
                //console.log('WebassemblyPackageTask', ...args);
                this.outputValues = [];
                const result = (module.instance.exports as any).main(...args);
                payload.result = result;
                payload.outputValues = this.outputValues;
                //console.log('WebassemblyPackageTask result', result);
                resolve(payload);
              })
              .catch((err) => {
                console.log('err loading wasm', err);
                reject();
              });
          } catch (error) {
            console.log('err instantiate wasm', error);
            reject();
          }
        } else {
          const args: any = [];
          this.wasmPackage.parameters.forEach((parameter) => {
            args.push(payload[parameter.name] || parameter.defaultValue || 0);
          });
          //console.log('WebassemblyPackageTask', ...args);

          memoryContext.exports = this.webassemblyModule.instance.exports;
          this.outputValues = [];
          const result = (this.webassemblyModule.instance.exports as any).main(...args);
          payload.result = result;
          payload.outputValues = this.outputValues;
          //console.log('WebassemblyPackageTask result', result);
          resolve(payload);
        }
      } else {
        resolve(payload);
      }
    });
  }

  public override getName() {
    return 'WebassemblyPackageTask';
  }
}
