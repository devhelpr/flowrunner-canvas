import fetch from 'cross-fetch';
import { FlowEventRunner } from '@devhelpr/flowrunner';

export interface ITestDefinition {
  name: string;
  startNode: string;
  nodes: any;
  expected: any;
  payload?: any;
}

const runTest = (testDefinition: ITestDefinition, loop, tests: ITestDefinition[], flowRunner: FlowEventRunner) => {
  return new Promise((resolve, reject) => {
    console.log('Running test', testDefinition.name);

    Object.keys(testDefinition.nodes).map(nodeName => {
      const node = testDefinition.nodes[nodeName];
      Object.keys(node).map(nodePropertyName => {
        flowRunner.setPropertyOnNode(nodeName, nodePropertyName, node[nodePropertyName], {});
      });
    });

    flowRunner
      .executeNode(testDefinition.startNode, testDefinition.payload || {})
      .then(payload => {
        console.log('flow result after test', payload);
        let failed = false;

        Object.keys(testDefinition.expected).map(expectedPropertyName => {
          console.log('test property', expectedPropertyName);
          if (
            Array.isArray((payload as any)[expectedPropertyName]) &&
            Array.isArray(testDefinition.expected[expectedPropertyName])
          ) {
            if ((payload as any)[expectedPropertyName].length == testDefinition.expected[expectedPropertyName].length) {
              (payload as any)[expectedPropertyName].map((item, index) => {
                if (item != testDefinition.expected[expectedPropertyName][index]) {
                  failed = true;
                  console.log(
                    'invalid array index value',
                    index,
                    item,
                    testDefinition.expected[expectedPropertyName][index],
                  );
                }
              });
            } else {
              failed = true;
              console.log(
                'invalid length',
                (payload as any)[expectedPropertyName].length,
                testDefinition.expected[expectedPropertyName].length,
              );
            }
          } else if ((payload as any)[expectedPropertyName] != testDefinition.expected[expectedPropertyName]) {
            failed = true;
            console.log(
              'invalid values',
              (payload as any)[expectedPropertyName],
              testDefinition.expected[expectedPropertyName],
            );
          }
        });
        if (failed) {
          console.log('Test FAILED');
          resolve({ result: false });
        } else {
          console.log('Test was succesful');
          resolve({ result: true });
        }
      })
      .catch(() => {
        console.log('Test run failed');
        reject();
      });
  });
};

export const testRunner = (flowId, flowRunner: FlowEventRunner, workerContext) => {
  try {
    fetch('/test?flow=' + flowId, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        if (res.status >= 400) {
          //throw new Error('Run-tests : Bad response from server (' + flowId + ')');
          workerContext.postMessage('worker', {
            command: 'TestRunnerResults',
            notFound: true,
          });
          return false;
        }
        return res.json();
      })
      .then(response => {
        if (!response) {
          return;
        }
        let results: any[] = [];
        const tests = response;
        let loop = 0;
        if (loop < tests.length) {
          let test = tests[loop];
          const performTest = () => {
            runTest(test, loop, tests, flowRunner)
              .then(result => {
                results.push({ name: test.name, result: result });
                loop++;
                if (loop < tests.length) {
                  test = tests[loop];
                  performTest();
                } else {
                  workerContext.postMessage('worker', {
                    command: 'TestRunnerResults',
                    results,
                  });
                  console.log('All tests have been run');
                }
              })
              .catch(() => {
                console.log('Error when running tests');
              });
          };
          performTest();
        }
      })
      .catch(err => {
        console.error(err);
        workerContext.postMessage('worker', {
          command: 'TestRunnerResults',
          error: true,
        });
      });
  } catch (err) {
    console.error(err);
    workerContext.postMessage('worker', {
      command: 'TestRunnerResults',
      error: true,
    });
  }
};
