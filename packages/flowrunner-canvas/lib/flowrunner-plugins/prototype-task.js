import { FlowTask } from '@devhelpr/flowrunner';
import { getWebassembly } from './components/webassembly';
export class PrototypeTask extends FlowTask {
    constructor() {
        super(...arguments);
        this.input = '';
    }
    execute(node, services) {
        if (node.prototype == 'webassembly-test') {
            return new Promise(async (resolve, reject) => {
                if (!this.wasm || this.input === '' || this.input !== node.input) {
                    this.input = node.input;
                    getWebassembly(node.input, 256, 256)
                        .then(data => {
                        this.wasm = data;
                        if (data && data.mainFunction) {
                            const payload = { ...node.payload };
                            try {
                                const result = data.mainFunction(payload['x'] || 0, payload['y'] || 0, payload['i'] || 0, payload['t'] || 0);
                                payload[node.outputProperty || 'result'] = result;
                                resolve(payload);
                            }
                            catch (err) {
                                console.log('getWebassembly catch err', err);
                                reject();
                            }
                        }
                        else {
                            console.log('getWebasm catch 1');
                            reject();
                        }
                    })
                        .catch(() => {
                        console.log('getWebasm catch 2');
                        reject();
                    });
                }
                else {
                    if (this.wasm && this.wasm.mainFunction) {
                        const payload = { ...node.payload };
                        const result = this.wasm.mainFunction(payload['x'] || 0, payload['y'] || 0, payload['i'] || 0, payload['t'] || 0, 256, 256);
                        payload[node.outputProperty || 'result'] = result;
                        resolve(payload);
                    }
                    else {
                        console.log('getWebasm catch 3');
                        reject();
                    }
                }
            });
        }
        return node.payload;
    }
    getName() {
        return 'PrototypeTask';
    }
}
//# sourceMappingURL=prototype-task.js.map