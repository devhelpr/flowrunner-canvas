import { IStorageProvider } from '@devhelpr/flowrunner-canvas-core';

let incomingFlowLocal: any[] = [];

let additionalTasks: any[];

let vscodeInstance: any = undefined;

function getTasks() {
  const tasks: any[] = [];

  tasks.push({
    className: 'AssignTask',
    fullName: 'AssignTask',
    flowType: 'playground',
  });
  tasks.push({
    className: 'IfConditionTask',
    fullName: 'IfConditionTask',
    flowType: 'playground',
  });
  tasks.push({
    className: 'DebugTask',
    fullName: 'DebugTask',
    flowType: 'playground',
  });
  tasks.push({
    className: 'ExpressionTask',
    fullName: 'ExpressionTask',
    flowType: 'playground',
  });
  tasks.push({
    className: 'FormTask',
    fullName: 'FormTask',
    flowType: 'playground',
  });

  if (additionalTasks) {
    tasks.push(...additionalTasks);
  }
  return tasks;
}

const compareObjects = (a: any, b: any) => {
  if (a === b) return true;

  if (typeof a != 'object' || typeof b != 'object' || a == null || b == null) return false;

  const keysA = Object.keys(a),
    keysB = Object.keys(b);

  if (keysA.length != keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;

    if (typeof a[key] === 'function' || typeof b[key] === 'function') {
      if (a[key].toString() != b[key].toString()) return false;
    } else {
      if (!compareObjects(a[key], b[key])) return false;
    }
  }

  return true;
};

function saveFlow(flowId: string, flow: any[]) {
  if (vscodeInstance) {
    //const state = vscodeInstance.getState();
    const currentFlow: any[] = incomingFlowLocal; //JSON.parse(state.text) || [];

    console.log('SAVEFLOW', currentFlow, flow);

    if (currentFlow.length === 0 || flow.length === 0) {
      return;
    }

    let equals = true;
    if (currentFlow.length === flow.length) {
      currentFlow.forEach((node) => {
        const incomingNode = flow.find((findNode) => findNode.name === node.name);
        if (!incomingNode || !compareObjects(node, incomingNode)) {
          equals = false;
        }
      });
    }

    if (currentFlow.length !== flow.length || !equals) {
      console.log('SAVEFLOW flows not equal');

      //vscodeInstance.setState({ text: JSON.stringify(flow) });
      //vscodeInstance.postMessage({ type: 'saveFlow', flow });
    }
  }
}

function setSelectedFlow(flowName: string) {
  //localStorage.setItem('selected-flow', flowName);
}

function getSelectedFlow() {
  return 'flow';
}

function storeFlowPackage(flowPackage: any) {
  if (flowPackage) {
    saveFlow(getSelectedFlow(), flowPackage.flow);
  }
}
function getFlowPackage() {
  if (vscodeInstance) {
    //const state = vscodeInstance.getState();
    const flow = incomingFlowLocal; //JSON.parse(state.text) || [];

    console.log('GETFLOWPACKAGE', flow);

    const flowPackage = {
      flow: flow,
      name: 'flow',
      id: 'flow',
      flowType: 'playground',
    };
    return flowPackage;
  }

  console.log('GETFLOWPACKAGE NO VSCODEINSTANCE');
  const flowPackage = {
    flow: [],
    name: 'emptyflow',
    id: 'emptyflow',
    flowType: 'playground',
  };
  return flowPackage;
}

function getFlows() {
  return [
    {
      fileName: 'flow.json',
      name: 'flow',
      id: 'flow',
      flowType: 'playground',
    },
  ];
}

function getFlow(flowId: string) {
  if (vscodeInstance) {
    //const state = vscodeInstance.getState();
    const flow = incomingFlowLocal; //JSON.parse(state.text) || [];
    console.log('GETFLOW', flowId, flow);
    return {
      flow: flow,
      flowType: 'playground',
      id: 'flow',
      name: 'flow',
    };
  }

  console.log('GETFLOW NO VSCODEINSTANCE');

  return {
    flow: [],
    flowType: 'playground',
    id: 'flow',
    name: 'flow',
  };
}

function setFlowName(flowId: string, flowName: string): Promise<string> {
  return new Promise((resolve) => {
    resolve(flowId);
  });
}

function getFlowName() {
  return 'flow';
}

export const createFlowrunnerStorageProvider = (vscode: any, incomingFlow: any[]) => {
  vscodeInstance = vscode;
  incomingFlowLocal = incomingFlow;
  return {
    getFlows: getFlows,
    getFlow: getFlow,
    saveFlow: saveFlow,
    setSelectedFlow: setSelectedFlow,
    getSelectedFlow: getSelectedFlow,
    getTasks: getTasks,
    getApiProxyUrl: () => {
      return '';
    },
    addFlow: (name, flow) => new Promise((resolve) => resolve('UUID')),
    isUI: false,
    isReadOnly: false,
    canStoreMultipleFlows: false,
    isAsync: false,
    setFlowName: setFlowName,
    getFlowName: getFlowName,
  } as IStorageProvider;
};
