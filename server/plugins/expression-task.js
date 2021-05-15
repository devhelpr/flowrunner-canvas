let ExpressionRunner = require('@devhelpr/expressionrunner');
let FlowRunner = require('@devhelpr/flowrunner');

class ExpressionTask extends FlowRunner.FlowTask {
  compiledExpressionTree = undefined;
  expression = '';

  execute(node, services) {
    return new Promise((resolve, reject) => {
      if (node.expression !== 'undefined' && node.expression !== '') {
        if (!this.compiledExpressionTree || this.expression !== node.expression) {
          this.compiledExpressionTree = ExpressionRunner.createExpressionTree(node.expression);
          this.expression = node.expression;
        }
        // force properties to number
        let payload = {};
        if (node.forceNumeric === true) {
          for (const property in node.payload) {
            if (node.payload.hasOwnProperty(property)) {
              payload[property] = parseFloat(node.payload[property]) || 0;
            }
          }
        } else {
          payload = node.payload;
        }
        try {
          const result = ExpressionRunner.executeExpressionTree(this.compiledExpressionTree, payload || {});
          if (node.mode && node.mode === 'numeric' && (isNaN(result) || result === 'undefined')) {
            console.log('ExpressionTask - result is NaN/undefined', result);
            reject();
          } else {
            let resultToPayload = result;
            if (node.rounding && node.rounding === 'floor') {
              resultToPayload = Math.floor(resultToPayload);
            }

            if (node.assignAsPropertyFromObject !== undefined && node.assignAsPropertyFromObject !== '') {
              node.payload[node.assignAsPropertyFromObject][node.assignToProperty] = resultToPayload;
            } else {
              node.payload[node.assignToProperty] = resultToPayload;
            }

            resolve(node.payload);
          }
        } catch (err) {
          console.log('ExpressionTask - error', err);
          reject();
        }
      } else {
        reject();
      }
    });
  }

  getName() {
    return 'ExpressionTask';
  }
}

module.exports = ExpressionTask;
