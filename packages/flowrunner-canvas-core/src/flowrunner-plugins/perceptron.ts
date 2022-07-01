import { FlowTask } from '@devhelpr/flowrunner';

function sigmoid(t) {
  return 1 / (1 + Math.pow(Math.E, -t));
}

export class WeightedSumTask extends FlowTask {
  public execute(node: any, services: any) {
    services.logMessage('RUNNING WeightedSumTask: ' + node.id + ' - ' + node.name);
    //const weights = services.flowEventRunner.getPropertyFromNode(node.weightsNode, 'weights');
    //const bias = services.flowEventRunner.getPropertyFromNode(node.weightsNode, 'bias');

    const weights = node.payload.weights || [];
    const bias = node.payload.bias;

    const weightedSum = node.payload.inputs.reduce((accumulator, input, index) => {
      if (index < weights.length) {
        return accumulator + input * weights[index];
      }
      return accumulator;
    }, 0);
    console.log(
      'weightedSum + node.bias',
      weightedSum + bias,
      node.payload.expected,
      node.payload.inputs,
      weights,
      bias,
    );
    return { ...node.payload, output: weightedSum + bias };
  }

  public getName() {
    return 'WeightedSumTask';
  }

  public getConfigMetaData() {
    return [];
  }
}

export class ActivationTask extends FlowTask {
  public execute(node: any, services: any) {
    services.logMessage('RUNNING ActivationTask: ' + node.id + ' - ' + node.name);
    const sigmoidResult = sigmoid(node.payload.output);
    console.log('sigmoidResult', sigmoidResult, sigmoidResult >= node.threshold, node.threshold);
    return { ...node.payload, output: sigmoidResult >= node.threshold ? 1 : 0 };
  }

  public getName() {
    return 'ActivationTask';
  }

  public getConfigMetaData() {
    return [];
  }
}

function delta(actual, expected, input, learnrate) {
  //console.log("delta params", actual, expected, input, learnrate);
  return (expected - actual) * learnrate * input;
}

export class UpdateWeightsTask extends FlowTask {
  public execute(node: any, services: any) {
    services.logMessage(
      'RUNNING UpdateWeightsTask: ' + node.id + ' - ' + node.name + ' node.weightsNode:' + node.weightsNode,
    );

    if (node.payload.output === node.payload.expected) {
      console.log('UpdateWeightsTask zonder', node.payload);
      return { ...node.payload };
    }

    const learnRate = 0.5;

    //console.log("output, expected input", node.payload.output , node.payload.expected, node.payload.inputs);

    //const weights = services.flowEventRunner.getPropertyFromNode(node.weightsNode, 'weights');
    //let bias = services.flowEventRunner.getPropertyFromNode(node.weightsNode, 'bias');

    let weights = [...node.payload.weights];
    let bias = node.payload.bias;
    console.log('UpdateWeightsTask', weights, bias);
    for (let index = 0; index < node.payload.inputs.length; index++) {
      let input = node.payload.inputs[index];
      let d = delta(node.payload.output, node.payload.expected, input, learnRate);
      //console.log("delta", d);
      weights[index] = weights[index] + d;
      if (isNaN(weights[index])) {
        console.log('isnan');
        throw new Error('weights[' + index + '] went to NaN!!');
      }
    }

    // send "threshold" to delta for bias instead of bias itself...
    let d = delta(node.payload.output, node.payload.expected, 1, learnRate);
    //console.log("delta bias", d);
    bias = bias + d;

    console.log('UpdateWeightsTask na delta', weights, bias);

    //services.flowEventRunner.setPropertyOnNode(node.weightsNode, 'weights', weights);
    //services.flowEventRunner.setPropertyOnNode(node.weightsNode, 'bias', bias);
    let payload = { ...node.payload };
    payload.weights = weights;
    payload.bias = bias;
    console.log('UpdateWeightsTask na delta payload', payload);
    return payload;
  }

  public getName() {
    return 'UpdateWeightsTask';
  }

  public getConfigMetaData() {
    return [];
  }
}
