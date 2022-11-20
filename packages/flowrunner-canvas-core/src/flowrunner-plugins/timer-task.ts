import { FlowTask } from '@devhelpr/flowrunner';
import { Subject } from 'rxjs';

const timerTriggerSubscriptions: any = {};

export const subscribeToTimer = (nodeName: string, observer: (value: string) => void) => {
  console.log('timer trigger subscribe', timerTriggerSubscriptions);

  if (!timerTriggerSubscriptions[nodeName]) {
    timerTriggerSubscriptions[nodeName] = new Subject<string>();
  }
  if (timerTriggerSubscriptions[nodeName]) {
    return (timerTriggerSubscriptions[nodeName] as Subject<string>).subscribe(observer);
  }
  return undefined;
};

export class TimerTask extends FlowTask {
  isExecuting: boolean = false;
  clearTimeout: any = undefined;
  node: any = undefined;
  flow: any;

  constructor() {
    super();
    console.log('create TimerTask');
  }

  public timer = () => {
    /*
  
        problem with pausing the flow is that this can happen during handling of
        executeNode internal emits, and then the executeNode/triggerEventOnNode never finished
  
      */
    if (!this.isExecuting) {
      this.isExecuting = true;

      if (timerTriggerSubscriptions[this.node.name] && this.node) {
        console.log('timer trigger');
        timerTriggerSubscriptions[this.node.name].next('trigger');
      }

      if (this.clearTimeout) {
        clearTimeout(this.clearTimeout);
        this.clearTimeout = undefined;
      }

      if (this.flow.isPaused()) {
        console.log('PAUSED');
        this.clearTimeout = setTimeout(this.timer, this.node.interval);
        return;
      }

      if (this.node.executeNode) {
        this.flow.executeNode(this.node.executeNode, this.node.payload || {}).then(() => {
          this.isExecuting = false;
          if (!!this.isBeingKilled) {
            return;
          }
          this.clearTimeout = setTimeout(this.timer, this.node.interval);
        });
      } else {
        this.flow.triggerEventOnNode(this.node.name, 'onTimer', { ...this.node.payload } || {}).then(() => {
          this.isExecuting = false;
          if (!!this.isBeingKilled) {
            return;
          }
          this.clearTimeout = setTimeout(this.timer, this.node.interval);
        });
      }
    } else {
      if (this.clearTimeout) {
        clearTimeout(this.clearTimeout);
        this.clearTimeout = undefined;
      }

      if (!!this.isBeingKilled) {
        return;
      }

      this.clearTimeout = setTimeout(this.timer, this.node.interval);
    }
  };

  public override execute(node: any, services: any) {
    this.node = node;
    this.isExecuting = false;
    this.flow = services.workerContext.flow;
    if (!timerTriggerSubscriptions[node.name]) {
      timerTriggerSubscriptions[node.name] = new Subject<string>();
    }

    //console.log('timer execute', node);
    if (node.mode === 'executeNode' || node.events) {
      if (this.clearTimeout) {
        clearTimeout(this.clearTimeout);
        this.clearTimeout = undefined;
      }
      this.clearTimeout = setTimeout(this.timer, node.interval);
      return true;
    } else {
      if (node.interval) {
        return false;
      }
    }

    return false;
  }

  isBeingKilled = false;
  public kill() {
    console.log('kill TimerTask');

    this.isBeingKilled = true;
    if (this.clearTimeout) {
      clearTimeout(this.clearTimeout);
      this.clearTimeout = undefined;
    }

    /*
    if (timerTriggerSubscriptions[this.node.name] && this.node) {
      timerTriggerSubscriptions[this.node.name].complete();
      timerTriggerSubscriptions[this.node.name] = undefined;
      delete timerTriggerSubscriptions[this.node.name];
    }
    */
  }

  public override getName() {
    return 'TimerTask';
  }
}
