import { FlowTask } from '@devhelpr/flowrunner';
import { Subject } from 'rxjs';
import { registerVariableObserver, unregisterVariableObserver } from '../flow-variables';

export class VariableChangeTriggerTask extends FlowTask {
  _nodeName: string = '';
  _variableName: any = undefined;

  public override execute(node: any, services: any) {
    if (!node.variableName) {
      return false;
    }
    if (this._variableName && this._variableName !== node.variableName && this._nodeName) {
      console.log('unregisterVariableObserver', this._variableName, this._nodeName);
      unregisterVariableObserver(this._variableName, this._nodeName);
    }
    this._variableName = node.variableName;
    const observable = new Subject<any>();
    this._nodeName = node.name;
    console.log('registerVariableObserver', this._variableName, this._nodeName);
    registerVariableObserver(node.variableName, node.name, (variableName, value) => {
      console.log('variable change', variableName, value);
      observable.next({
        nodeName: node.name,
        payload: {
          ...node.payload,
          [node.variableName]: value,
        },
      });
    });

    return observable;
  }

  public kill() {
    unregisterVariableObserver(this._variableName, this._nodeName);
    this._variableName = undefined;
  }

  public isStartingOnInitFlow() {
    return true;
  }

  public override getName() {
    return 'VariableChangeTriggerTask';
  }
}
