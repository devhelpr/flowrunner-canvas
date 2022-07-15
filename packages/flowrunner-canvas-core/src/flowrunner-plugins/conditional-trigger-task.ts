import { FlowTask } from '@devhelpr/flowrunner';

export class ConditionalTriggerTask extends FlowTask {
  public override execute(node: any, services: any) {
    //console.log('ConditionalTriggerTask', node);
    try {
      if (node.propertyName) {
        if (node.minValue && node.maxValue) {
          let value = node.payload[node.propertyName];
          //console.log('ConditionalTriggerTask v', value, node.minValue, node.maxValue);
          if (!isNaN(value)) {
            if (value >= node.minValue && value < node.maxValue) {
              return Object.assign({}, node.payload);
            }
          }
        }
      }
    } catch (err) {
      console.log('ConditionalTriggerTask error', err);
    }

    let errors: any[] = [];
    errors.push({
      error: node.name + ' failed',
      name: node.name,
    });

    const payload = Object.assign({}, node.payload, {
      errors,
      followFlow: 'isError',
    });
    return payload;
    //return false;
  }

  public override getName() {
    return 'ConditionalTriggerTask';
  }
}
