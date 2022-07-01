import { FlowTask } from '@devhelpr/flowrunner';
import { FlowLoader } from './components/flow-loader';
import * as uuid from 'uuid';
const uuidV4 = uuid.v4;
export class MatrixTask extends FlowTask {
    constructor() {
        super(...arguments);
        this.webassembly = undefined;
        this.performance = undefined;
    }
    execute(node, services) {
        if (this.performance === undefined) {
            this.performance = performance.now();
        }
        let _payload = { ...node.payload };
        if (node.name != 'MatrixTask4' && node.name != 'gameOfLive') {
        }
        if (node.propertyName) {
            let nodeName = node.name;
            if (node.useMatrixFromNode) {
                nodeName = node.useMatrixFromNode;
            }
            if (node.payload && node.action == 'setCellOnNewGeneration') {
                let newMatrix = services.flowEventRunner.getPropertyFromNode(nodeName, node.propertyName + 'NEW');
                let currentMatrix = services.flowEventRunner.getPropertyFromNode(nodeName, node.propertyName);
                if (currentMatrix.uuid != _payload.uuid) {
                    return false;
                }
                if (newMatrix.uuid != currentMatrix.uuid) {
                    return false;
                }
                if (!newMatrix) {
                    return false;
                }
                if (node.payload.x >= newMatrix.columns && node.payload.y >= newMatrix.rows) {
                    return false;
                }
                let index = newMatrix.columns * node.payload.y + node.payload.x;
                if (index >= newMatrix.data.length) {
                    return false;
                }
                newMatrix.data[index] = node.payload.value;
                services.flowEventRunner.setPropertyOnNode(nodeName, node.propertyName + 'NEW', newMatrix);
                newMatrix = null;
                return true;
            }
            let matrix = services.flowEventRunner.getPropertyFromNode(nodeName, node.propertyName) || {
                data: [],
                columns: 0,
                rows: 0,
                uuid: '',
            };
            let payload = Object.assign({}, node.payload);
            if (node.action) {
                if (node.action == 'init' || node.action == 'clear') {
                    matrix = {
                        columns: node.columns,
                        rows: node.rows,
                        uuid: uuidV4(),
                        data: new Array(node.columns * node.rows).fill(node.defaultValue || 0),
                    };
                    services.flowEventRunner.setPropertyOnNode(nodeName, node.propertyName, matrix);
                }
                else if (node.action == 'get') {
                    if (matrix.uuid != payload.uuid) {
                        return false;
                    }
                    payload.data = matrix.data;
                    payload.columns = matrix.columns;
                    payload.rows = matrix.rows;
                    matrix = null;
                    return payload;
                }
                else if (node.action == 'getNeighbourCountForCell') {
                    try {
                        if (payload.x >= matrix.columns && payload.y >= matrix.rows) {
                            matrix = null;
                            return false;
                        }
                        if (matrix.uuid != payload.uuid) {
                            matrix = null;
                            return false;
                        }
                        let neighbourCount = 0;
                        let loopRows = payload.y - 1;
                        while (loopRows <= payload.y + 1) {
                            let loopColumns = payload.x - 1;
                            while (loopColumns <= payload.x + 1) {
                                if (!(loopColumns == payload.x && loopRows == payload.y)) {
                                    {
                                        let helperRows = loopRows;
                                        let helperColumns = loopColumns;
                                        if (helperRows < 0) {
                                            helperRows = matrix.rows + helperRows;
                                        }
                                        if (helperColumns < 0) {
                                            helperColumns = matrix.columns + helperColumns;
                                        }
                                        if (helperRows >= matrix.rows) {
                                            helperRows = helperRows - matrix.rows;
                                        }
                                        if (helperColumns >= matrix.columns) {
                                            helperColumns = helperColumns - matrix.columns;
                                        }
                                        let index = matrix.columns * helperRows + helperColumns;
                                        if (index < matrix.data.length && matrix.data[index] > 0) {
                                            neighbourCount++;
                                        }
                                    }
                                }
                                loopColumns++;
                            }
                            loopRows++;
                        }
                        payload.neighbourCount = neighbourCount;
                    }
                    catch (err) {
                        console.log(err);
                        return false;
                    }
                }
                else if (node.action == 'setup') {
                    matrix = null;
                    matrix = {
                        columns: node.columns,
                        rows: node.rows,
                        uuid: uuidV4(),
                        data: new Array(node.columns * node.rows).fill(node.defaultValue || 0),
                    };
                    try {
                        ((_payload && _payload.values) || node.values || []).map(value => {
                            if (value.x >= 0 && value.y >= 0) {
                                let index = matrix.columns * value.y + value.x;
                                if (index < matrix.data.length) {
                                    matrix.data[index] = value.value;
                                }
                            }
                        });
                    }
                    catch (err) {
                        console.log(err);
                        return false;
                    }
                    payload['uuid'] = matrix.uuid;
                    services.flowEventRunner.setPropertyOnNode(nodeName, node.propertyName, matrix);
                }
                else if (node.action == 'calculateNewGenerationByRustFlow') {
                    try {
                        let currentUUID = matrix.uuid;
                        let data = '';
                        matrix.data.map(cell => {
                            data += cell == 1 ? '1' : '0';
                        });
                        if (this.webassembly === undefined) {
                            if (node.flowId) {
                                const loader = new FlowLoader();
                                return new Promise((resolve, reject) => {
                                    loader
                                        .getFlow(node.flowId)
                                        .then(flow => {
                                        const webAssembly = services.getWebAssembly();
                                        this.webassembly = webAssembly.Flowrunner.new(`["columns","rows","data"]`, `{"flow":${JSON.stringify(flow)}}
										`);
                                        resolve({});
                                    })
                                        .catch(() => {
                                        reject();
                                    });
                                });
                            }
                        }
                        let payload = this.webassembly.convert(`{
							"columns" : {
							  "valueInt" : ${matrix.columns}
							},
							"rows" : {
							  "valueInt" : ${matrix.rows}
							},
							"data" : {
							  "value" : "${data}"
							}
						  }`);
                        let result = payload.value;
                        let loop = 0;
                        let numberData = [];
                        while (loop < result.length) {
                            const cell = result[loop];
                            if (cell == '0') {
                                numberData.push(0);
                            }
                            else {
                                numberData.push(1);
                            }
                            loop++;
                        }
                        let newMatrix = {
                            columns: matrix.columns,
                            rows: matrix.rows,
                            uuid: currentUUID,
                            data: numberData,
                        };
                        services.flowEventRunner.setPropertyOnNode(nodeName, node.propertyName, newMatrix);
                    }
                    catch (ex) {
                        console.log('calculateNewGenerationByRust', ex);
                    }
                }
                else if (node.action == 'calculateNewGeneration') {
                    try {
                        let currentUUID = matrix.uuid;
                        let newMatrix = {
                            columns: matrix.columns,
                            rows: matrix.rows,
                            uuid: matrix.uuid,
                            data: new Array(matrix.columns * matrix.rows).fill(node.defaultValue || 0),
                        };
                        let neigbourMatrix = {
                            columns: matrix.columns,
                            rows: matrix.rows,
                            uuid: matrix.uuid,
                            data: new Array(matrix.columns * matrix.rows).fill(node.defaultValue || 0),
                        };
                        if (node.calculateNeighbours === undefined || node.calculateNeighbours === true) {
                            let loopRows = 0;
                            while (loopRows < matrix.rows) {
                                let loopColumns = 0;
                                while (loopColumns < matrix.columns) {
                                    const getNeighbourState = (x, y) => {
                                        let result = 0;
                                        let helperRows = loopRows + y;
                                        let helperColumns = loopColumns + x;
                                        if (helperRows < 0) {
                                            helperRows = matrix.rows + helperRows;
                                        }
                                        if (helperColumns < 0) {
                                            helperColumns = matrix.columns + helperColumns;
                                        }
                                        if (helperRows >= matrix.rows) {
                                            helperRows = helperRows - matrix.rows;
                                        }
                                        if (helperColumns >= matrix.columns) {
                                            helperColumns = helperColumns - matrix.columns;
                                        }
                                        let index = matrix.columns * helperRows + helperColumns;
                                        if (index < matrix.data.length && matrix.data[index] > 0) {
                                            result++;
                                        }
                                        return result;
                                    };
                                    let neighbourCount = getNeighbourState(-1, -1) +
                                        getNeighbourState(0, -1) +
                                        getNeighbourState(1, -1) +
                                        getNeighbourState(-1, 0) +
                                        getNeighbourState(1, 0) +
                                        getNeighbourState(-1, 1) +
                                        getNeighbourState(0, 1) +
                                        getNeighbourState(1, 1);
                                    let index = matrix.columns * loopRows + loopColumns;
                                    neigbourMatrix.data[index] = neighbourCount;
                                    loopColumns++;
                                }
                                loopRows++;
                            }
                        }
                        const executeFlowForEachCell = nodeName => {
                            let promises = [];
                            let loopRows = 0;
                            let time = performance.now() - this.performance;
                            while (loopRows < matrix.rows) {
                                let loopColumns = 0;
                                while (loopColumns < matrix.columns) {
                                    let value = 0;
                                    let index = matrix.columns * loopRows + loopColumns;
                                    if (index < matrix.data.length) {
                                        value = matrix.data[index];
                                    }
                                    promises.push(services.flowEventRunner.triggerEventOnNode(nodeName, 'onCalculateNewGenerationForEachCell', {
                                        value: value,
                                        x: loopColumns,
                                        y: loopRows,
                                        uuid: currentUUID,
                                        neighbourCount: neigbourMatrix.data[index],
                                        time: time,
                                        t: time,
                                        index: loopRows * matrix.columns + loopColumns,
                                        i: loopRows * matrix.columns + loopColumns,
                                    } || {}));
                                    loopColumns++;
                                }
                                loopRows++;
                            }
                            nodeName = null;
                            return promises;
                        };
                        let promise = new Promise((mainResolve, mainReject) => {
                            services.flowEventRunner
                                .triggerEventOnNode(node.name, 'onCalculateNewGenerationForEachCell', {
                                value: 0,
                                x: 0,
                                y: 0,
                                uuid: currentUUID,
                                neighbourCount: 0,
                                time: 0,
                                t: 0,
                                index: 0,
                                i: 0,
                            })
                                .then(() => {
                                try {
                                    let innerPromise = new Promise((resolve, reject) => {
                                        Promise.all(executeFlowForEachCell(node.name))
                                            .then(values => {
                                            matrix = null;
                                            let currentMatrix = services.flowEventRunner.getPropertyFromNode(nodeName, node.propertyName);
                                            if (currentMatrix.uuid != currentUUID) {
                                                console.log('currentMatrix.uuid != currentUUID', currentMatrix.uuid, currentUUID);
                                                currentMatrix = null;
                                                reject();
                                                return false;
                                            }
                                            currentMatrix = null;
                                            values.map((resultPayload, index) => {
                                                if (resultPayload !== undefined) {
                                                    if (resultPayload.isAlive === undefined) {
                                                        newMatrix.data[newMatrix.columns * resultPayload.y + resultPayload.x] =
                                                            resultPayload.value || 0;
                                                    }
                                                    else if (resultPayload.isAlive === 1) {
                                                        newMatrix.data[newMatrix.columns * resultPayload.y + resultPayload.x] = 1;
                                                    }
                                                }
                                            });
                                            services.flowEventRunner.setPropertyOnNode(nodeName, node.propertyName, newMatrix);
                                            newMatrix = null;
                                            matrix = null;
                                            neigbourMatrix = null;
                                            services.flowEventRunner.setPropertyOnNode(nodeName, node.propertyName + 'NEW', null);
                                            resolve(_payload);
                                            _payload = null;
                                        })
                                            .catch(() => {
                                            console.log('matrix error');
                                            newMatrix = null;
                                            matrix = null;
                                            reject();
                                            neigbourMatrix = null;
                                            _payload = null;
                                        });
                                    });
                                    innerPromise
                                        .then(payload => {
                                        mainResolve(payload);
                                    })
                                        .catch(() => {
                                        console.log('matrix inner reject');
                                        mainReject();
                                    });
                                }
                                catch (err) {
                                    console.log('catch err', err);
                                }
                            });
                        });
                        return promise;
                    }
                    catch (err) {
                        console.log('error', err);
                        return false;
                    }
                }
            }
            matrix = null;
            return payload;
        }
        return node.payload;
    }
    kill() {
    }
    getName() {
        return 'MatrixTask';
    }
}
//# sourceMappingURL=matrix-task.js.map