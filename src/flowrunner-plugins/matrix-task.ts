import { FlowTask } from '@devhelpr/flowrunner';
import { FlowLoader } from './components/flow-loader';
import * as uuid from 'uuid';
const uuidV4 = uuid.v4;

export interface IMatrix {
  columns: number;
  rows: number;
  uuid: string;
  data: number[];
}

export class MatrixTask extends FlowTask {
  webassembly: any = undefined;
  performance: any = undefined;
  public execute(node: any, services: any) {
    //console.log("MatrixTask execute", node);
    if (this.performance === undefined) {
      this.performance = performance.now();
    }
    let _payload = { ...node.payload };
    if (node.name != 'MatrixTask4' && node.name != 'gameOfLive') {
      //console.log(node.name, node);
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

        /*
					can we optimize this by not doing setCellOnNewGeneration for 
					every cell but only once per generation
				*/

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

      let matrix: IMatrix = services.flowEventRunner.getPropertyFromNode(nodeName, node.propertyName) || {
        data: [],
        columns: 0,
        rows: 0,
        uuid: '',
      };
      /*
				matrix = {
				columns
				rows
				data [columns * rows]        
				}

				actions 
				init : setup matrix
				clear : clear matrix
				setup : values[] : x/y/value

				getNeighbourCountForCell : x,y
				calculateNewGeneration
			*/
      let payload = Object.assign({}, node.payload);
      if (node.action) {
        if (node.action == 'init' || node.action == 'clear') {
          matrix = {
            columns: node.columns,
            rows: node.rows,
            uuid: uuidV4(),
            data: new Array(node.columns * node.rows).fill(node.defaultValue || 0),
          };
          console.log('matrix new', matrix);
          services.flowEventRunner.setPropertyOnNode(nodeName, node.propertyName, matrix);
        } else if (node.action == 'get') {
          if (matrix.uuid != payload.uuid) {
            return false;
          }

          payload.data = matrix.data;
          payload.columns = matrix.columns;
          payload.rows = matrix.rows;

          //console.log("matrix get", payload);
          (matrix as any) = null;

          return payload;
        } else if (node.action == 'getNeighbourCountForCell') {
          /*
						can we optimize this by not doing getPropertyFromNode for 
						every cell but only once and pass it on via the payload ??

					*/

          try {
            if (payload.x >= matrix.columns && payload.y >= matrix.rows) {
              (matrix as any) = null;
              return false;
            }

            if (matrix.uuid != payload.uuid) {
              (matrix as any) = null;
              return false;
            }

            let neighbourCount = 0;
            let loopRows = payload.y - 1;
            //let indexes : any[] = [];
            while (loopRows <= payload.y + 1) {
              let loopColumns = payload.x - 1;
              while (loopColumns <= payload.x + 1) {
                if (!(loopColumns == payload.x && loopRows == payload.y)) {
                  //if (loopColumns >= 0 && loopRows >= 0)
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
                    //indexes.push(index);
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
          } catch (err) {
            console.log(err);
            return false;
          }
        } else if (node.action == 'setup') {
          (matrix as any) = null;
          matrix = {
            columns: node.columns,
            rows: node.rows,
            uuid: uuidV4(),
            data: new Array(node.columns * node.rows).fill(node.defaultValue || 0),
          };
          console.log('matrix setup', node, matrix, _payload);
          // matrix
          // values[] : x,y,value
          try {
            ((_payload && _payload.values) || node.values || []).map(value => {
              if (value.x >= 0 && value.y >= 0) {
                let index = matrix.columns * value.y + value.x;
                if (index < matrix.data.length) {
                  matrix.data[index] = value.value;
                }
              }
            });
          } catch (err) {
            console.log(err);
            return false;
          }
          payload['uuid'] = matrix.uuid;

          services.flowEventRunner.setPropertyOnNode(nodeName, node.propertyName, matrix);
        } else if (node.action == 'calculateNewGenerationByRust') {
          try {
            let currentUUID = matrix.uuid;
            let data = '';
            matrix.data.map(cell => {
              data += cell == 1 ? '1' : '0';
            });
            const webAssembly = services.getWebAssembly();
            //console.log(webAssembly);
            const universe = webAssembly.Universe.new(matrix.columns, matrix.rows, data);
            universe.tick();
            let result = universe.render();
            //console.log(data);
            let loop = 0;
            let numberData: number[] = [];
            while (loop < result.length) {
              const cell = result[loop];
              if (cell == '0') {
                numberData.push(0);
              } else {
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
          } catch (ex) {
            console.log('calculateNewGenerationByRust', ex);
          }
        } else if (node.action == 'calculateNewGenerationByRustFlow') {
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
                      console.log('RunWasmFlowTask', node.name, flow);

                      const webAssembly = services.getWebAssembly();
                      this.webassembly = webAssembly.Flowrunner.new(
                        `["columns","rows","data"]`,
                        `{"flow":${JSON.stringify(flow)}}
										`,
                      );
                      resolve();
                    })
                    .catch(() => {
                      reject();
                    });
                });
              }
              /*
							const webAssembly = services.getWebAssembly();
							this.webassembly = webAssembly.Flowrunner.new(`["columns","rows","data"]`,`{"flow":${JSON.stringify(node.flow)}}
							  `);
*/
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

            //console.log(data);
            let result = payload.value;
            let loop = 0;
            let numberData: number[] = [];
            while (loop < result.length) {
              const cell = result[loop];
              if (cell == '0') {
                numberData.push(0);
              } else {
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
          } catch (ex) {
            console.log('calculateNewGenerationByRust', ex);
          }
        } else if (node.action == 'calculateNewGeneration') {
          try {
            /*
							performance optimalization
							- create temp matrix filled with neighbourCount for each cell
							- foreach executeFlowForEachCell : add neighbourCount for that cell to payload
							- result payload: if (payload.isAlive) .. then add living cell to result matrix


						*/

            let currentUUID = matrix.uuid;

            let newMatrix = {
              columns: matrix.columns,
              rows: matrix.rows,
              uuid: matrix.uuid,
              data: new Array(matrix.columns * matrix.rows).fill(node.defaultValue || 0),
            };
            //services.flowEventRunner.setPropertyOnNode(nodeName, node.propertyName + "NEW", newMatrix);
            //(newMatrix as any) = null;

            let neigbourMatrix = {
              columns: matrix.columns,
              rows: matrix.rows,
              uuid: matrix.uuid,
              data: new Array(matrix.columns * matrix.rows).fill(node.defaultValue || 0),
            };

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
                  //indexes.push(index);
                  if (index < matrix.data.length && matrix.data[index] > 0) {
                    result++;
                  }
                  return result;
                };

                let neighbourCount =
                  getNeighbourState(-1, -1) +
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

            const executeFlowForEachCell = nodeName => {
              //console.log("executeFlowForEachCell", nodeName);
              let promises: any[] = [];
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
                  //console.log(loopRows, loopColumns);
                  ///promises.push(flow.executeNode(node.executeNode, {value: value, x: loopColumns, y: loopRows} || {}));
                  // onCalculateNewGenerationForEachCell
                  
                  promises.push(
                    services.flowEventRunner.triggerEventOnNode(
                      nodeName,
                      'onCalculateNewGenerationForEachCell',
                      {
                        value: value,
                        x: loopColumns,
                        y: loopRows,
                        uuid: currentUUID,
                        neighbourCount: neigbourMatrix.data[index],
                        time: time,
                        t: time,
                        index: loopRows*matrix.columns + loopColumns,
                        i: loopRows*matrix.columns + loopColumns
                      } || {},
                    ),
                  );
                  loopColumns++;
                }
                loopRows++;
              }
              nodeName = null;
              return promises;
            };

            let promise = new Promise((resolve, reject) => {
              Promise.all(executeFlowForEachCell(node.name))
                .then(values => {
                  (matrix as any) = null;
                  //let _matrix = services.flowEventRunner.getPropertyFromNode(nodeName, node.propertyName + "NEW");

                  let currentMatrix = services.flowEventRunner.getPropertyFromNode(nodeName, node.propertyName);
                  if (currentMatrix.uuid != currentUUID) {
                    //|| _matrix.uuid != currentMatrix.uuid
                    currentMatrix = null;
                    reject();
                    return false;
                  }
                  currentMatrix = null;

                  values.map((resultPayload, index) => {
                    if (resultPayload !== undefined) {
                      if (resultPayload.isAlive === undefined) {
                        newMatrix.data[newMatrix.columns * resultPayload.y + resultPayload.x] = resultPayload.value || 0;
                      } else
                      if (resultPayload.isAlive === 1) {
                        newMatrix.data[newMatrix.columns * resultPayload.y + resultPayload.x] = 1;
                      }
                    }
                  });

                  /*if (_matrix.uuid != currentUUID) {
										(_matrix as any) = null;
										reject();
										return;
									}
									*/
                  //console.log("onCalculateNewGenerationForEachCell resolved",node.name, matrix);

                  //console.log("calculate new generation", matrix);

                  services.flowEventRunner.setPropertyOnNode(nodeName, node.propertyName, newMatrix);
                  //(_matrix as any) = null;
                  (newMatrix as any) = null;
                  (matrix as any) = null;
                  (neigbourMatrix as any) = null;
                  services.flowEventRunner.setPropertyOnNode(nodeName, node.propertyName + 'NEW', null);
                  resolve(_payload);
                  _payload = null;
                })
                .catch(() => {
                  //console.log("matrix error");
                  (newMatrix as any) = null;
                  (matrix as any) = null;
                  reject();
                  (neigbourMatrix as any) = null;
                  _payload = null;
                });
            });

            (matrix as any) = null;
            return promise;
          } catch (err) {
            console.log('error', err);
            return false;
          }
        }
        //payload[node.propertyName] = matrix;
      }

      (matrix as any) = null;
      return payload;
    }
    return node.payload;
  }

  public kill() {
    //
  }

  public getName() {
    return 'MatrixTask';
  }
}
