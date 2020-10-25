import { FlowTask } from '@devhelpr/flowrunner';
//import { ExpressionParser } from '../../../../../expression/react-prototype/react-prototype1/src/components/ExpressionParser';
//import { ExpressionTreeExecute, executeExpressionTree, extractValueParametersFromExpressionTree } from '../../../../../expression/react-prototype/react-prototype1/src/components/ExpressionTreeExecute';
//import { isRangeValue, getRangeFromValues, getRangeValueParameters } from '../../../../../expression/react-prototype/react-prototype1/src/utils/grid-values';
import {
  createExpressionTree,
  executeExpressionTree,
  extractValueParametersFromExpressionTree,
  getRangeValueParameters,
  isRangeValue,
} from '@devhelpr/expressionrunner';

/*
	TODO

	- support for =INDEX(A1:A5,2) // returns A2
	- support for =VLOOKUP(B12; A2:C10; 3; 1)
		- en HLOOKUP 

		- parameters
			- de waarde die je wilt zoeken
			- de range waarin je wilt zoeken en van waaruit je waarde wil teruggeven
			- cell index binnen rij die je gevonden hebt
			- 0: exacte match , 1 : niet exacte match

	- support for namespaces (data from other grids can be put in a namespace)


	- support for rows/columns like AA134
	- support for formulas over ranges like SUM(A1:Z1)

	- UI : edit input like in excel which is in top of all cells
	- UI : show labels next to rows and on top op columns
	- UI : show results of formula in cell instead of the formula itself
	- UI : when focussing the cell ... focus the edit input

	- ouput of Task is values array with calculated formulas

	- UI : support for named cells

*/
export class DataGridTask extends FlowTask {
  private convertGridToNamedVariables = (values: any[]) => {
    let variables = {};
    values.map((rowValues, rowIndex) => {
      if (rowValues) {
        rowValues.map((cellValue, columnIndex) => {
          if (cellValue) {
            /*
		TODO:

			- check if cell contains reference to namespace (contains a dot)
			- if so... get the data from the namespace

*/

            if (cellValue === '' || (cellValue != '' && cellValue[0] !== '=')) {
              let letter = String.fromCharCode((columnIndex % 26) + 65);
              let value = Number(cellValue);
              if (isNaN(value)) {
                value = cellValue;
              }
              variables[letter + (rowIndex + 1)] = value;
            }
          }
        });
      }
    });
    return variables;
  };

  public execute(node: any, services: any) {
    try {
      let payload = Object.assign({}, node.payload);
      let promises: any[] = [];
      let infoCells: any[] = [];
      let values: any[] = [];

      if (node.values) {
        let variables = { ...payload, values: node.values, ...this.convertGridToNamedVariables(node.values) };
        node.values.map((rowValues, rowIndex) => {
          if (rowValues) {
            values.push([...rowValues]);
            rowValues.map((cellValue, columnIndex) => {
              if (cellValue && cellValue != '') {
                if (cellValue[0] === '=') {
                  /*

	- get all formulas 
		- foreach formula get the value parameters AND the cell name
	- sort all formulas
		- node that is being referenced by one of the nodes of the other node comes first
		- if both nodes reference each other, then a circular reference is found and an exception is thrown
	- create an object with all used value parameters
	- execute formulas in order of sorting
		- for each execution, update the value parameters

*/

                  let tree = createExpressionTree(cellValue.substring(1));

                  let letter = String.fromCharCode((columnIndex % 26) + 65);
                  infoCells.push({
                    name: letter + (rowIndex + 1),
                    row: rowIndex,
                    column: columnIndex,
                    expressionTree: tree,
                    valueParameters: extractValueParametersFromExpressionTree(tree),
                  });
                }
              }
            });
          }
        });

        infoCells.map(infoCell => {
          let includeParameters: string[] = [];
          infoCell.valueParameters.map(valueParameter => {
            if (isRangeValue(valueParameter)) {
              includeParameters = getRangeValueParameters(valueParameter);
            }
            return true;
          });
          infoCell.valueParameters.push(includeParameters);
          return true;
        });
        infoCells.sort((a, b) => {
          // TODO :
          // 	- extract range from valueParameter it is a range
          // - isRangeValue
          const aIsAValueParameterOfB = b.valueParameters.indexOf(a.name) >= 0;
          const bIsAValueParameterOfA = a.valueParameters.indexOf(b.name) >= 0;
          if (aIsAValueParameterOfB && bIsAValueParameterOfA) {
            throw new Error('Cirular reference found ' + a.name + ' and ' + b.name);
          }
          if (aIsAValueParameterOfB) {
            return -1;
          }
          if (bIsAValueParameterOfA) {
            return 1;
          }
          return 0;
        });

        const promise = new Promise((resolve, reject) => {
          try {
            infoCells.map(infoCell => {
              const value = executeExpressionTree(infoCell.expressionTree, variables || {});
              variables[infoCell.name] = value;
              return true;
            });

            infoCells.map(infoCell => {
              let row = [...values[infoCell.row]];
              row[infoCell.column] = variables[infoCell.name];
              values[infoCell.row] = row;
              return true;
            });

            if (node.nameSpace) {
              payload[node.nameSpace] = values;
            } else {
              payload.values = values;
            }
            resolve(payload);

            /*Promise.all(promises).then((data) => {
							//console.log("DataGridTask results", data);
							data.map((value , index) => {
								//payload[infoCells[index].name] = value;
								const infoCell = infoCells[index];
								let row = [...values[infoCell.row]];
								row[infoCell.column] = value;
								values[infoCell.row] = row;
							});
							payload.values = values;
							resolve(payload);
						}).catch(() => {
							reject();
						});
						*/
          } catch (err) {
            console.log('DataGridTask exception when executing expressions', err);
          }
        });

        return promise;
      } else {
        return false;
      }
    } catch (err) {
      console.log('DataGridTask exception', err);
      return false;
    }
  }

  public getName() {
    return 'DataGridTask';
  }
}
