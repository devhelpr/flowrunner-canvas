import { FlowTask, FlowEventRunner } from '@devhelpr/flowrunner';
import { FlowLoader } from './components/flow-loader';
import { FlowConnector } from '../flow-connector';
import { IWorker } from '../interfaces/IWorker';
import { getWorker } from '../flow-worker';

/*
  can we create a worker here an use that to run?
  do we need a new instance of the FlowConnector?
  or can we connect this new worker to the exisiting FlowConnector?
    .. we should call registerWorker
    .. but a FlowConnector can only be connected to one worker
    .. and .. the visual component of an external loaded flow are currently not visible
  For calculations and logic, it should not be a problem to run flow without UI
    .. perhaps we need a new flowtype : "logicflow"

  How to get the results of a flow?
  Should we only be allowed to trigger a specific node in a flow?
    .. in the FlowTask select a node without inputs to trigger.. like a sort of function
    .. and the use executeNode to run the flow and wait for the results being posted from the worker

  For now: 
    - select flow (flowtype playground)
    - input nodename as text
    - create worker and flowconnector
    - execute node by nodename

*/
interface Worker {}

export class RunFlowTask extends FlowTask {
  flowrunner: any = undefined;
  worker?: Worker = undefined;
  flowrunnerConnector?: FlowConnector;

  public execute(node: any, services: any) {
    try {
      if (!this.worker && !this.flowrunnerConnector) {
        //this.worker = new Worker(new URL('../flow-worker', import.meta.url));
        this.worker = getWorker();
        this.flowrunnerConnector = new FlowConnector();
        this.flowrunnerConnector.registerWorker(this.worker as IWorker);

        if (node.flowId && node.nodeName) {
          const loader = new FlowLoader();
          return new Promise((resolve, reject) => {
            loader
              .getFlow(node.flowId, true)
              .then(flow => {
                console.log('RunFlowTask', node.name, flow);

                let payload = { ...node.payload };
                payload.sendMessageOnResolve = true;

                this.flowrunnerConnector?.registerOnReceiveFlowNodeExecuteResult(payload => {
                  console.log('RunFlowTask payload', node.name, payload);
                  if (payload === false) {
                    reject();
                  } else {
                    resolve(payload);
                  }
                });
                this.flowrunnerConnector?.setFlowType('playground');
                this.flowrunnerConnector?.pushFlowToFlowrunner(flow, false, node.flowId);
                this.flowrunnerConnector?.executeFlowNode(node.nodeName, payload);
              })
              .catch(() => {
                reject();
              });
          });
        }
        /*const webAssembly = services.getWebAssembly();
				this.webassemblyFlowrunner = webAssembly.Flowrunner.new(`[]`,
					`{"flow":${JSON.stringify(node.flow)}}`);
				*/
      } else {
        return false;
        //let payload = Object.assign({}, node.payload, this.flowrunner.convert(JSON.stringify({})));
        //return payload;
      }

      //console.log("payload" , payload);
      //return false;
    } catch (err) {
      console.log('RunFlowTask error', err);
      return false;
    }
  }

  public kill() {
    if (this.worker) {
      (this.worker as any).terminate();
    }
    this.flowrunnerConnector = undefined;
    this.worker = undefined;
  }

  public getName() {
    return 'RunFlowTask';
  }
}
