import { FlowTask } from '@devhelpr/flowrunner';

export interface IMatrix {
	columns: number;
	rows: number;
	data: number[];
  }
  
export class MatrixTask extends FlowTask {
	public execute(node: any, services: any) {
	//console.log("MatrixTask execute", node);
		let _payload = {...node.payload};
		if (node.name != "MatrixTask4" && node.name != "gameOfLive") {
			//console.log(node.name, node);
		}
		if (node.propertyName) {
			let nodeName = node.name;
			if (node.useMatrixFromNode) {
				nodeName = node.useMatrixFromNode;
			}

			if (node.payload && node.action == 'setCellOnNewGeneration') {   
				let newMatrix = services.flowEventRunner.getPropertyFromNode(nodeName, node.propertyName + "NEW");

				/*
					can we optimize this by not doing setCellOnNewGeneration for 
					every cell but only once per generation
				*/

				if (!newMatrix) {
					return false;
				}

				if (node.payload.x >= newMatrix.columns && node.payload.y >= newMatrix.rows)
				{
					return false;
				}

				let index = (newMatrix.columns * node.payload.y) + node.payload.x;
				if (index >= newMatrix.data.length) {
					return false;
				}
				newMatrix.data[index] = node.payload.value;
				services.flowEventRunner.setPropertyOnNode(nodeName, node.propertyName + "NEW", newMatrix);
				newMatrix = null;
				return true;
			}

			let matrix: IMatrix = services.flowEventRunner.getPropertyFromNode(nodeName, node.propertyName) || {
				data: [],
				columns: 0,
				rows: 0
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
						columns : node.columns,
						rows: node.rows,
						data: new Array(node.columns * node.rows).fill(node.defaultValue || 0)
					};
					console.log("matrix new", matrix);
					services.flowEventRunner.setPropertyOnNode(nodeName, node.propertyName, matrix);
				} else
				if (node.action == 'get') {
					payload.data = matrix.data;
					payload.columns = matrix.columns;
					payload.rows = matrix.rows;

					//console.log("matrix get", payload);
					(matrix as any) = null;

					return payload;
				} else
				if (node.action == 'getNeighbourCountForCell') {
					
					/*
						can we optimize this by not doing getPropertyFromNode for 
						every cell but only once and pass it on via the payload ??

					*/

					try {
						if (payload.x >= matrix.columns && payload.y >= matrix.rows) {
							(matrix as any) = null;
							return false;
						}

						let neighbourCount = 0;
						let loopRows = payload.y - 1;            
						//let indexes : any[] = [];
						while ((loopRows <= payload.y + 1)) {

							let loopColumns = payload.x - 1;
							while ((loopColumns <= payload.x + 1)) {
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

										let index = (matrix.columns * helperRows) + helperColumns;
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

				} else
				if (node.action == 'setup') {

					console.log("matrix setup", node , matrix);
					// matrix
					// values[] : x,y,value
					try {
						(node.values || []).map(value => {
							if (value.x >= 0 && value.y >= 0) {
								let index = (matrix.columns * value.y) + value.x;
								if (index < matrix.data.length) {
									matrix.data[index] = value.value;
								}
							}
						});
					} catch(err) {
						console.log(err);
						return false;
					}
					
					services.flowEventRunner.setPropertyOnNode(nodeName, node.propertyName, matrix);         
				} else
				if (node.action == 'calculateNewGeneration') {
					
					try {
						let newMatrix = {
							columns : matrix.columns,
							rows: matrix.rows,
							data: new Array(matrix.columns * matrix.rows).fill(node.defaultValue || 0)
						};
						services.flowEventRunner.setPropertyOnNode(nodeName, node.propertyName + "NEW", newMatrix);
						(newMatrix as any) = null;
						
						const executeFlowForEachCell = (nodeName) => {
							//console.log("executeFlowForEachCell", nodeName);
							let promises : any[] = [];
							let loopRows = 0;            
							while (loopRows < matrix.rows) {
								let loopColumns = 0;
								while (loopColumns < matrix.columns) {
									let value = 0;
									let index = (matrix.columns * loopRows) + loopColumns;
									if (index < matrix.data.length) {
										value = matrix.data[index];
									}
									//console.log(loopRows, loopColumns);
									///promises.push(flow.executeNode(node.executeNode, {value: value, x: loopColumns, y: loopRows} || {}));
									// onCalculateNewGenerationForEachCell  
									promises.push(services.flowEventRunner.triggerEventOnNode(nodeName, "onCalculateNewGenerationForEachCell" , {value: value, x: loopColumns, y: loopRows} || {}));
									loopColumns++;
								}
								loopRows++;
							}
							nodeName = null;
							return promises;
						}
						
						let promise = new Promise((resolve, reject) => {
							Promise.all(executeFlowForEachCell(node.name)).then((values) => {
									(matrix as any) = null;
									let _matrix = services.flowEventRunner.getPropertyFromNode(nodeName, node.propertyName + "NEW");
									//console.log("onCalculateNewGenerationForEachCell resolved",node.name, matrix);

									//console.log("calculate new generation", matrix);
						
									services.flowEventRunner.setPropertyOnNode(nodeName, node.propertyName, _matrix);
									(_matrix as any) = null;
									(newMatrix as any) = null;
									(matrix as any) = null;
									services.flowEventRunner.setPropertyOnNode(nodeName, node.propertyName + "NEW", null);
									resolve(_payload);
									_payload = null;
								}
							).catch(() => {
								
								resolve(_payload);
								_payload = null;
							});
						});
						
						(matrix as any) = null;
						return promise;            

					} catch (err) {
						console.log("error", err);
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