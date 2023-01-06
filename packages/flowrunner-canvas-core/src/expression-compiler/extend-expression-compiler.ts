import { registerCustomFunction } from '@devhelpr/expression-compiler';
import { getRangeFromValues, getRangeValueParameters, isRangeValue } from '@devhelpr/expressionrunner';

/*function executeFunctionOnRange(range: string, payload: any, customFunction: (value: number, currentValue) => number) {
  if (range.indexOf('row:') === 0) {
    let row = parseInt(range.split('row:')[1]) - 1;
    let helperValues = payload?.values;
    if (!helperValues) {
      return { result: 0, count: 0 };
    }
    let result = 0;
    helperValues[row].forEach((cell) => {
      result += Number(cell) || 0;
    });
    return { result, count: helperValues.length };
  } else if (range >= 'column:A' && range <= 'column:Z') {
    let column = range.split('column:')[1];
    let helperValues = payload?.values;
    if (!helperValues) {
      return { result: 0, count: 0 };
    }
    let result = 0;
    helperValues.forEach((row) => {
      const numberValue: Number = Number(column.charCodeAt(0) as Number) - 65;
      if (numberValue < row.length) {
        result = customFunction(Number((row as any[])[numberValue as unknown as any]) || 0, result);
      }
    });
    return { result, count: helperValues.length };
  } else if (isRangeValue(range)) {
    const rangeValues = getRangeFromValues(payload?.values, range.toString());
    const valueParameterNames = getRangeValueParameters(range.toString());
    let result = 0;
    console.log(rangeValues);
    rangeValues.forEach((value, index) => {
      if (payload[valueParameterNames[index]]) {
        result = customFunction(Number(payload[valueParameterNames[index]]) || 0, result);
      } else {
        result = customFunction(Number(value) || 0, result);
      }
    });
    return { result, count: rangeValues.length };
  } else {
    // todo ... add other arguments as well
    return { result: 0, count: 0 };
  }
}*/

export function executeFunctionOnRange(
  range: string,
  payload: any,
  customFunction: (value: number, currentValue) => number,
) {
  const helperValues = payload?.values;

  if (!helperValues) {
    return { result: 0, count: 0 };
  }

  let result = 0;
  let count = 0;

  if (range.indexOf('row:') === 0) {
    const rowIndex = parseInt(range.split('row:')[1]) - 1;
    helperValues[rowIndex].forEach((cell) => {
      result += Number(cell) || 0;
    });
    count = helperValues[rowIndex].length;
  } else if (range >= 'column:A' && range <= 'column:Z') {
    const column = range.split('column:')[1];
    const columnIndex = Number(column.charCodeAt(0)) - 65;
    helperValues.forEach((row) => {
      if (columnIndex < row.length) {
        result = customFunction(Number(row[columnIndex]) || 0, result);
      }
    });
    count = helperValues.length;
  } else if (isRangeValue(range)) {
    const rangeValues = getRangeFromValues(helperValues, range.toString());
    const valueParameterNames = getRangeValueParameters(range.toString());
    rangeValues.forEach((value, index) => {
      if (payload[valueParameterNames[index]]) {
        result = customFunction(Number(payload[valueParameterNames[index]]) || 0, result);
      } else {
        result = customFunction(Number(value) || 0, result);
      }
    });
    count = rangeValues.length;
  }

  return { result, count };
}

export const extendExpressionCompiler = () => {
  registerCustomFunction(
    'sum',
    [],
    ((payload, range: string) => {
      console.log('sum', range);
      return executeFunctionOnRange(range, payload, (a, b) => a + b).result;
    }) as unknown as (value: number, ...args: number[]) => number,
    true,
  );

  registerCustomFunction(
    'avg',
    [],
    ((payload, range: string) => {
      const result = executeFunctionOnRange(range, payload, (a, b) => a + b);
      if (result.count > 0) {
        return result.result / result.count;
      }
      return 0;
    }) as unknown as (value: number, ...args: number[]) => number,
    true,
  );
};
