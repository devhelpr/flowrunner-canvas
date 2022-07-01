import { FlowTask } from '@devhelpr/flowrunner';
import { FlowLoader } from './components/flow-loader';
import { FlowConnector } from '../flow-connector';
export class RunFlowTask extends FlowTask {
    constructor() {
        super(...arguments);
        this.flowrunner = undefined;
        this.worker = undefined;
    }
    execute(node, services) {
        try {
            if (!this.worker && !this.flowrunnerConnector) {
                this.worker = services.getWorker();
                this.flowrunnerConnector = new FlowConnector();
                this.flowrunnerConnector.registerWorker(this.worker);
                if (node.flow) {
                    return new Promise((resolve, reject) => {
                        var _a, _b, _c, _d;
                        let payload = { ...node.payload };
                        payload.sendMessageOnResolve = true;
                        (_a = this.flowrunnerConnector) === null || _a === void 0 ? void 0 : _a.registerOnReceiveFlowNodeExecuteResult(payload => {
                            console.log('RunFlowTask payload', node.name, payload);
                            if (payload === false) {
                                return false;
                            }
                            else {
                                resolve(payload);
                            }
                        });
                        (_b = this.flowrunnerConnector) === null || _b === void 0 ? void 0 : _b.setFlowType('playground');
                        (_c = this.flowrunnerConnector) === null || _c === void 0 ? void 0 : _c.pushFlowToFlowrunner(JSON.parse(node.flow), false, node.flowId);
                        (_d = this.flowrunnerConnector) === null || _d === void 0 ? void 0 : _d.executeFlowNode(node.startNode, payload);
                    });
                }
                else if (node.flowId && node.nodeName) {
                    const loader = new FlowLoader();
                    return new Promise((resolve, reject) => {
                        loader
                            .getFlow(node.flowId, true)
                            .then(flow => {
                            var _a, _b, _c, _d;
                            console.log('RunFlowTask', node.name, flow);
                            let payload = { ...node.payload };
                            payload.sendMessageOnResolve = true;
                            (_a = this.flowrunnerConnector) === null || _a === void 0 ? void 0 : _a.registerOnReceiveFlowNodeExecuteResult(payload => {
                                console.log('RunFlowTask payload', node.name, payload);
                                if (payload === false) {
                                    reject();
                                }
                                else {
                                    resolve(payload);
                                }
                            });
                            (_b = this.flowrunnerConnector) === null || _b === void 0 ? void 0 : _b.setFlowType('playground');
                            (_c = this.flowrunnerConnector) === null || _c === void 0 ? void 0 : _c.pushFlowToFlowrunner(flow, false, node.flowId);
                            (_d = this.flowrunnerConnector) === null || _d === void 0 ? void 0 : _d.executeFlowNode(node.nodeName, payload);
                        })
                            .catch(() => {
                            reject();
                        });
                    });
                }
            }
            else {
                return false;
            }
        }
        catch (err) {
            console.log('RunFlowTask error', err);
            return false;
        }
    }
    kill() {
        if (this.worker) {
            this.worker.terminate();
        }
        this.flowrunnerConnector = undefined;
        this.worker = undefined;
    }
    getName() {
        return 'RunFlowTask';
    }
}
//# sourceMappingURL=run-flow-task.js.map