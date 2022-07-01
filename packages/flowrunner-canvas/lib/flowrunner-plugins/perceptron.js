import { FlowTask } from '@devhelpr/flowrunner';
function sigmoid(t) {
    return 1 / (1 + Math.pow(Math.E, -t));
}
export class WeightedSumTask extends FlowTask {
    execute(node, services) {
        services.logMessage('RUNNING WeightedSumTask: ' + node.id + ' - ' + node.name);
        const weights = node.payload.weights || [];
        const bias = node.payload.bias;
        const weightedSum = node.payload.inputs.reduce((accumulator, input, index) => {
            if (index < weights.length) {
                return accumulator + input * weights[index];
            }
            return accumulator;
        }, 0);
        console.log('weightedSum + node.bias', weightedSum + bias, node.payload.expected, node.payload.inputs, weights, bias);
        return { ...node.payload, output: weightedSum + bias };
    }
    getName() {
        return 'WeightedSumTask';
    }
    getConfigMetaData() {
        return [];
    }
}
export class ActivationTask extends FlowTask {
    execute(node, services) {
        services.logMessage('RUNNING ActivationTask: ' + node.id + ' - ' + node.name);
        const sigmoidResult = sigmoid(node.payload.output);
        console.log('sigmoidResult', sigmoidResult, sigmoidResult >= node.threshold, node.threshold);
        return { ...node.payload, output: sigmoidResult >= node.threshold ? 1 : 0 };
    }
    getName() {
        return 'ActivationTask';
    }
    getConfigMetaData() {
        return [];
    }
}
function delta(actual, expected, input, learnrate) {
    return (expected - actual) * learnrate * input;
}
export class UpdateWeightsTask extends FlowTask {
    execute(node, services) {
        services.logMessage('RUNNING UpdateWeightsTask: ' + node.id + ' - ' + node.name + ' node.weightsNode:' + node.weightsNode);
        if (node.payload.output === node.payload.expected) {
            console.log('UpdateWeightsTask zonder', node.payload);
            return { ...node.payload };
        }
        const learnRate = 0.5;
        let weights = [...node.payload.weights];
        let bias = node.payload.bias;
        console.log('UpdateWeightsTask', weights, bias);
        for (let index = 0; index < node.payload.inputs.length; index++) {
            let input = node.payload.inputs[index];
            let d = delta(node.payload.output, node.payload.expected, input, learnRate);
            weights[index] = weights[index] + d;
            if (isNaN(weights[index])) {
                console.log('isnan');
                throw new Error('weights[' + index + '] went to NaN!!');
            }
        }
        let d = delta(node.payload.output, node.payload.expected, 1, learnRate);
        bias = bias + d;
        console.log('UpdateWeightsTask na delta', weights, bias);
        let payload = { ...node.payload };
        payload.weights = weights;
        payload.bias = bias;
        console.log('UpdateWeightsTask na delta payload', payload);
        return payload;
    }
    getName() {
        return 'UpdateWeightsTask';
    }
    getConfigMetaData() {
        return [];
    }
}
//# sourceMappingURL=perceptron.js.map