let variableStore: any = {};

let variableObservers: any = {};

export const resetVariableStore = () => {
  variableStore = {};
  variableObservers = {};
};

export const createVariable = (variableName: string, value: any) => {
  variableStore[variableName] = value;
};

export const registerVariableObserver = (
  variableName: string,
  id: string,
  callback: (variableName: string, value: any) => void,
) => {
  if (!variableObservers[variableName]) {
    variableObservers[variableName] = {};
  }
  variableObservers[variableName][id] = callback;
};

export const unregisterVariableObserver = (variableName: string, id: string) => {
  if (variableObservers[variableName]) {
    delete variableObservers[variableName][id];
  }
  return;
};

export const setVariableValue = (variableName: string, value: any) => {
  const hasChanged = variableStore[variableName] !== value;
  if (Array.isArray(variableStore[variableName])) {
    variableStore[variableName].push(value);
  } else {
    variableStore[variableName] = value;
  }
  console.log('setVariableValue', variableName, value);
  const newValue = variableStore[variableName];
  if (hasChanged && variableObservers[variableName]) {
    console.log('setVariableValue hasChanged', variableName, newValue);
    Object.keys(variableObservers[variableName]).forEach((observerKey) => {
      console.log('setVariableValue call observer', observerKey, variableName, newValue);
      variableObservers[variableName][observerKey](variableName, newValue);
    });
  }
};

export const createVariableStore = (flow: any) => {
  flow.forEach((node) => {
    if (node.taskType === 'Variable') {
      if (node.variableName) {
        console.log('createVariable', node.variableName, node.initialValue);
        createVariable(node.variableName, node.initialValue === '[]' ? [] : node.initialValue || '');
      }
    }
  });
};

export const isVariable = (variableName: string) => {
  return variableName && variableStore[variableName] !== undefined;
};
