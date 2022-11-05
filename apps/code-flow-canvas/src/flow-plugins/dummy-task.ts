import { FlowTask } from '@devhelpr/flowrunner';

export class DummyTestTask extends FlowTask {
  public override execute(node: any, services: any) {
    const payload = { ...node.payload };
    // node.wasm.fileData
    return new Promise((resolve, reject) => {
      if (node.wasm && node.wasm.fileData) {
        const binaryString = atob(node.wasm.fileData);
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

        WebAssembly.instantiate(wasm, importObject)
          .then((module) => {
            const result = (module.instance.exports as any).main(payload['a'] || 0, payload['b'] || 0);
            payload.result = result;
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
    return 'DummyTestTask';
  }
}
