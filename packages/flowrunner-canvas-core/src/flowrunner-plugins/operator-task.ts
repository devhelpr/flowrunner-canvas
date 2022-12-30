import { FlowTask } from '@devhelpr/flowrunner';
import { getPropertyByNamespacedName } from '../helpers/namespaced-properties';
import { createExpressionTree, executeExpressionTree } from '@devhelpr/expressionrunner';
import { threadId } from 'worker_threads';

function setCharAt(str, index, chr) {
  if (index > str.length - 1) return str;
  return str.substring(0, index) + chr + str.substring(index + 1);
}

export class OperatorTask extends FlowTask {
  private findExpressionTree: any | null = null;
  private findExpression: string | null = null;
  private deleteExpressionTree: any | null = null;
  private deleteExpression: string | null = null;

  public override execute(node: any, services: any) {
    const flow = services.workerContext.flow;

    const callErrorFlow = () => {
      flow.triggerEventOnNode(node.name, 'onError', node.payload);
    };

    let payload = structuredClone(node.payload);

    try {
      if (node.operator === 'fill' && node.assignToProperty && node.fillValue) {
        const fillLength = parseInt(payload[node.fillLength]) || parseInt(node.fillLength) || 0;
        if (node.fillMode === 'string') {
          payload[node.assignToProperty] = new Array(fillLength + 1).join(node.fillValue);
        } else {
          const fillValue = payload[node.fillValue] || node.fillValue;
          payload[node.assignToProperty] = new Array(fillLength).fill(fillValue);
        }
      } else if (node.operator === 'log' && node.inputProperty) {
        const inputPropertyValue = getPropertyByNamespacedName(node.inputProperty, payload);
        console.log(`Operation`, JSON.stringify(inputPropertyValue, null, 2));
      } else if (node.inputProperty && node.assignToProperty && node.operator) {
        const inputPropertyValue = getPropertyByNamespacedName(node.inputProperty, payload);
        if (node.operator === 'split' && node.splitOn && inputPropertyValue) {
          const splitOn = node.splitOn.replaceAll('[ENTER]', '\n').replaceAll('[SPACE]', ' ');
          payload[node.assignToProperty] = inputPropertyValue.split(splitOn);
        } else if (node.operator === 'length' && inputPropertyValue) {
          payload[node.assignToProperty] = inputPropertyValue.length;
        } else if (node.operator === 'sort' && inputPropertyValue) {
          if (!node.sortOnProperty) {
            if (node.sortDirection === 'descending') {
              payload[node.assignToProperty] = inputPropertyValue.sort((a, b) => {
                if (a > b) {
                  return -1;
                }
                if (a < b) {
                  return 1;
                }
                return 0;
              });
            } else {
              payload[node.assignToProperty] = inputPropertyValue.sort();
            }
          } else {
            payload[node.assignToProperty] = inputPropertyValue.sort((a, b) => {
              if (node.sortDirection === 'descending') {
                if (a[node.sortOnProperty] > b[node.sortOnProperty]) {
                  return -1;
                }

                if (a[node.sortOnProperty] < b[node.sortOnProperty]) {
                  return 1;
                }

                return 0;
              }
              if (a[node.sortOnProperty] < b[node.sortOnProperty]) {
                return -1;
              }

              if (a[node.sortOnProperty] > b[node.sortOnProperty]) {
                return 1;
              }

              return 0;
            });
          }
        } else if (node.operator === 'sum' && inputPropertyValue) {
          let sum = 0;
          inputPropertyValue.forEach((item) => {
            sum += parseFloat(item) || 0;
          });
          payload[node.assignToProperty] = sum;
        } else if (node.operator === 'first' && inputPropertyValue) {
          payload[node.assignToProperty] = inputPropertyValue[0];
        } else if (node.operator === 'get-by-index' && inputPropertyValue && node.index) {
          let index = parseInt(node.index);
          if (isNaN(index)) {
            index = parseInt(getPropertyByNamespacedName(node.index, payload));
          }
          payload[node.assignToProperty] = node.returnPropertyOfObject
            ? inputPropertyValue[index][node.returnPropertyOfObject]
            : inputPropertyValue[index];
        } else if (node.operator === 'get-char-by-index' && inputPropertyValue && node.index) {
          let index = parseInt(node.index);
          if (isNaN(index)) {
            index = parseInt(getPropertyByNamespacedName(node.index, payload));
          }
          payload[node.assignToProperty] = node.returnPropertyOfObject
            ? inputPropertyValue[index][node.returnPropertyOfObject].charCodeAt(0)
            : inputPropertyValue[index].charCodeAt(0);
        } else if (
          node.operator === 'set-by-index' &&
          inputPropertyValue &&
          node.index &&
          payload[node.assignToProperty]
        ) {
          let index = parseInt(node.index);
          if (isNaN(index)) {
            index = parseInt(getPropertyByNamespacedName(node.index, payload));
          }
          if (index >= 0 && index < payload[node.assignToProperty].length) {
            if (typeof payload[node.assignToProperty] === 'string') {
              payload[node.assignToProperty] = setCharAt(payload[node.assignToProperty], index, inputPropertyValue);
            } else {
              payload[node.assignToProperty][index] = inputPropertyValue;
            }
          }
        } else if (node.operator === 'get-by-2d-index' && inputPropertyValue && node.column && node.row) {
          let column = parseInt(node.column);
          if (isNaN(column)) {
            column = parseInt(getPropertyByNamespacedName(node.column, payload));
          }
          let row = parseInt(node.row);
          if (isNaN(row)) {
            row = parseInt(getPropertyByNamespacedName(node.row, payload));
          }
          payload[node.assignToProperty] = inputPropertyValue[row][column];
        } else if (node.operator === 'get-char-by-2d-index' && inputPropertyValue && node.column && node.row) {
          let column = parseInt(node.column);
          if (isNaN(column)) {
            column = parseInt(getPropertyByNamespacedName(node.column, payload));
          }
          let row = parseInt(node.row);
          if (isNaN(row)) {
            row = parseInt(getPropertyByNamespacedName(node.row, payload));
          }
          payload[node.assignToProperty] = inputPropertyValue[row][column].charCodeAt(0);
        } else if (
          node.operator === 'set-by-2d-index' &&
          inputPropertyValue &&
          node.column &&
          node.row &&
          payload[node.assignToProperty]
        ) {
          let column = parseInt(node.column);
          if (isNaN(column)) {
            column = parseInt(getPropertyByNamespacedName(node.column, payload));
          }
          let row = parseInt(node.row);
          if (isNaN(row)) {
            row = parseInt(getPropertyByNamespacedName(node.row, payload));
          }
          if (typeof payload[node.assignToProperty][row] === 'string') {
            payload[node.assignToProperty][row] = setCharAt(
              payload[node.assignToProperty][row],
              column,
              inputPropertyValue,
            );
          } else {
            payload[node.assignToProperty][row][column] = inputPropertyValue;
          }
        } else if (node.operator === 'assign-to-payload' && inputPropertyValue) {
          payload = { ...payload, ...inputPropertyValue };
        } else if (node.operator === 'match-regex' && node.regex && inputPropertyValue) {
          const regex = new RegExp(node.regex, 'g');

          const matches = inputPropertyValue.matchAll(regex);
          const results: any[] = [];
          for (const match of matches) {
            results.push({
              match: match[0],
              indexMatch: match.index,
              length: match[0].length,
            });
            //console.log(`Found ${match[0]} start=${match.index} end=${match.index + match[0].length}.`);
          }

          payload[node.assignToProperty] = results; //[...payload[node.inputProperty].match(regex)];
        } else if (node.operator === 'reverse' && inputPropertyValue) {
          payload[node.assignToProperty] = inputPropertyValue.reverse();
        } else if (node.operator === 'shift' && inputPropertyValue) {
          payload[node.assignToProperty] = inputPropertyValue.shift();
          if (node.resultAfterShift) {
            payload[node.resultAfterShift] = inputPropertyValue;
          }
        } else if (node.operator === 'pop' && inputPropertyValue) {
          payload[node.assignToProperty] = inputPropertyValue.pop();
          if (node.popAfterShift) {
            payload[node.popAfterShift] = inputPropertyValue;
          }
        } else if (node.operator === 'getProperty' && inputPropertyValue) {
          payload[node.assignToProperty] = inputPropertyValue;
        } else if (node.operator === 'pushToArray' && inputPropertyValue) {
          if (payload[node.assignToProperty] && Array.isArray(payload[node.assignToProperty])) {
            payload[node.assignToProperty].push(inputPropertyValue);
          }
        } else if (node.operator === 'trim' && inputPropertyValue) {
          payload[node.assignToProperty] = inputPropertyValue.trim();
        } else if (node.operator === 'flattenArray' && inputPropertyValue) {
          if (Array.isArray(inputPropertyValue)) {
            const result = inputPropertyValue
              .map((input) => getPropertyByNamespacedName(node.flattenProperty, input))
              .filter((value) => {
                if (typeof value === 'string') {
                  return value.trim();
                }
                return true;
              });

            payload[node.assignToProperty] = [...result];
          }
        } else if (node.operator === 'find' && node.findMode) {
          if (node.findMode === 'expression') {
            if (node.findExpression) {
              if (node.findExpression !== this.findExpression || this.findExpression === null) {
                this.findExpressionTree = createExpressionTree(node.findExpression);
                this.findExpression = node.findExpression;
              }
              payload[node.assignToProperty] = inputPropertyValue.find(
                (item) => executeExpressionTree(this.findExpressionTree, { ...payload, ...item }) == 1,
              );
            }
          } else if (node.findMode === 'object') {
            if (node.findProperty && node.findValue) {
              payload[node.assignToProperty] = inputPropertyValue.find(
                (item) => item[node.findProperty] == node.findValue,
              );
            }
          } else {
            if (typeof inputPropertyValue === 'string' && node.findValue) {
              payload[node.assignToProperty] = inputPropertyValue.indexOf(node.findValue);
            } else {
              payload[node.assignToProperty] = inputPropertyValue.find((item) => item === node.findValue);
            }
          }

          if (!payload[node.assignToProperty]) {
            callErrorFlow();
            return;
          }
        } else if (node.operator === 'deleteFromArray' && node.deleteMode) {
          if (node.deleteMode === 'expression') {
            if (node.deleteExpression) {
              if (node.deleteExpression !== this.deleteExpression || this.deleteExpression === null) {
                this.deleteExpressionTree = createExpressionTree(node.deleteExpression);
                this.deleteExpression = node.deleteExpression;
              }
              const index = inputPropertyValue.findIndex((item) => {
                console.log('deleteFromArray', { ...payload, ...item });
                return executeExpressionTree(this.deleteExpressionTree, { ...payload, ...item }) == 1;
              });
              if (index >= 0) {
                inputPropertyValue.splice(index, 1);
              } else {
                if (!payload[node.assignToProperty]) {
                  callErrorFlow();
                  return;
                }
              }
            }
          } else {
            if (node.index >= 0) {
              inputPropertyValue.splice(node.index, 1);
            } else {
              if (!payload[node.assignToProperty]) {
                callErrorFlow();
                return;
              }
            }
          }
        }
      }
    } catch (err) {
      console.log('OperatorTask error', err);
    }
    return payload;
  }

  public override getName() {
    return 'OperatorTask';
  }
}
