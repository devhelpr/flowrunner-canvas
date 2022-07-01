import fetch from 'cross-fetch';
const runTest = (testDefinition, loop, tests, flowRunner) => {
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
                if (Array.isArray(payload[expectedPropertyName]) &&
                    Array.isArray(testDefinition.expected[expectedPropertyName])) {
                    if (payload[expectedPropertyName].length == testDefinition.expected[expectedPropertyName].length) {
                        payload[expectedPropertyName].map((item, index) => {
                            if (item != testDefinition.expected[expectedPropertyName][index]) {
                                failed = true;
                                console.log('invalid array index value', index, item, testDefinition.expected[expectedPropertyName][index]);
                            }
                        });
                    }
                    else {
                        failed = true;
                        console.log('invalid length', payload[expectedPropertyName].length, testDefinition.expected[expectedPropertyName].length);
                    }
                }
                else if (payload[expectedPropertyName] != testDefinition.expected[expectedPropertyName]) {
                    failed = true;
                    console.log('invalid values', payload[expectedPropertyName], testDefinition.expected[expectedPropertyName]);
                }
            });
            if (failed) {
                console.log('Test FAILED');
                resolve({ result: false });
            }
            else {
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
export const testRunner = (flowId, flowRunner, workerContext) => {
    try {
        fetch('/test?flow=' + flowId, {
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(res => {
            if (res.status >= 400) {
                workerContext.postMessage('external', {
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
            let results = [];
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
                        }
                        else {
                            workerContext.postMessage('external', {
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
    }
    catch (err) {
        console.error(err);
        workerContext.postMessage('worker', {
            command: 'TestRunnerResults',
            error: true,
        });
    }
};
//# sourceMappingURL=tests-runner.js.map