import { FlowTask } from '@devhelpr/flowrunner';
import { setVariableValue } from '../flow-variables';
import { getPropertyByNamespacedName } from '../helpers/namespaced-properties';

export class SetVariableTask extends FlowTask {
  public override execute(node: any, services: any) {
    if (node.inputProperty && node.variableName) {
      const inputPropertyValue = getPropertyByNamespacedName(node.inputProperty, node.payload);
      setVariableValue(node.variableName, structuredClone(inputPropertyValue), true);
    }
    return node.payload;
  }

  public override getName() {
    return 'SetVariable';
  }
}
