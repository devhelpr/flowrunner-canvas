import { executeFunctionOnRange } from './extend-expression-compiler';

describe('executeFunctionOnRange', () => {
  it('should return the sum of all cell values in a given row', () => {
    const payload = {
      values: [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
      ],
    };
    const range = 'row:2';
    const customFunction = (value: number, currentValue: number) => currentValue + value;
    const expectedResult = { result: 15, count: 3 };
    expect(executeFunctionOnRange(range, payload, customFunction)).toEqual(expectedResult);
  });

  it('should return the sum of all cell values in a given column', () => {
    const payload = {
      values: [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
      ],
    };
    const range = 'column:B';
    const customFunction = (value: number, currentValue: number) => currentValue + value;
    const expectedResult = { result: 15, count: 3 };
    expect(executeFunctionOnRange(range, payload, customFunction)).toEqual(expectedResult);
  });

  it('should return the result of the custom function applied to all cell values in a given range', () => {
    const payload = {
      values: [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
      ],
      value1: '10',
      value2: '20',
    };
    const range = 'A1:C3';
    const customFunction = (value: number, currentValue: number) => currentValue + value;
    const expectedResult = { result: 45, count: 9 };
    expect(executeFunctionOnRange(range, payload, customFunction)).toEqual(expectedResult);
  });

  it('should return the result of the custom function applied to all cell values in a given range when payload values are missing', () => {
    const payload = {
      values: [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
      ],
      value1: '10',
      value3: '30',
    };
    const range = 'A1:C3';
    const customFunction = (value: number, currentValue: number) => currentValue + value;
    const expectedResult = { result: 45, count: 9 };
    expect(executeFunctionOnRange(range, payload, customFunction)).toEqual(expectedResult);
  });

  it('should return 0 for result and count when range is not recognized', () => {
    const payload = {
      values: [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
      ],
    };
    const range = 'invalid';
    const customFunction = (value: number, currentValue: number) => currentValue + value;
    const expectedResult = { result: 0, count: 0 };
    expect(executeFunctionOnRange(range, payload, customFunction)).toEqual(expectedResult);
  });
});
