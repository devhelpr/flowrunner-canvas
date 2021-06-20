import { IStorageProvider } from './interfaces/IStorageProvider';

function getTasks() {
  let tasks: any[] = [];

  tasks.push({
    className: 'AssignTask',
    fullName: 'AssignTask',
    flowType: 'playground',
  });
  tasks.push({
    className: 'ClearTask',
    fullName: 'ClearTask',
    flowType: 'playground',
  });
  tasks.push({
    className: 'InjectIntoPayloadTask',
    fullName: 'InjectIntoPayloadTask',
    flowType: 'playground',
  });
  tasks.push({
    className: 'IfConditionTask',
    fullName: 'IfConditionTask',
    flowType: 'playground',
  });
  tasks.push({
    className: 'PreviewTask',
    fullName: 'PreviewTask',
    flowType: 'playground',
  });
  tasks.push({
    className: 'DebugTask',
    fullName: 'DebugTask',
    flowType: 'playground',
  });
  tasks.push({
    className: 'SliderTask',
    fullName: 'SliderTask',
    flowType: 'playground',
  });
  tasks.push({
    className: 'RandomTask',
    fullName: 'RandomTask',
    flowType: 'playground',
  });
  tasks.push({
    className: 'TimerTask',
    fullName: 'TimerTask',
    flowType: 'playground',
  });
  tasks.push({
    className: 'ExpressionTask',
    fullName: 'ExpressionTask',
    flowType: 'playground',
  });
  tasks.push({
    className: 'OutputValueTask',
    fullName: 'OutputValueTask',
    flowType: 'playground',
  });
  tasks.push({
    className: 'ConditionalTriggerTask',
    fullName: 'ConditionalTriggerTask',
    flowType: 'playground',
  });
  tasks.push({
    className: 'MapPayloadTask',
    fullName: 'MapPayloadTask',
    flowType: 'playground',
  });
  tasks.push({
    className: 'InputTask',
    fullName: 'InputTask',
    flowType: 'playground',
  });
  tasks.push({
    className: 'ListTask',
    fullName: 'ListTask',
    flowType: 'playground',
  });
  tasks.push({
    className: 'MatrixTask',
    fullName: 'MatrixTask',
    flowType: 'playground',
  });
  tasks.push({
    className: 'GridEditTask',
    fullName: 'GridEditTask',
    flowType: 'playground',
  });
  tasks.push({
    className: 'DataGridTask',
    fullName: 'DataGridTask',
    flowType: 'playground',
  });
  tasks.push({
    className: 'SearchDataGridTask',
    fullName: 'SearchDataGridTask',
    flowType: 'playground',
  });
  tasks.push({
    className: 'FilterDataGridTask',
    fullName: 'FilterDataGridTask',
    flowType: 'playground',
  });
  tasks.push({
    className: 'TransformTask',
    fullName: 'TransformTask',
    flowType: 'playground',
  });
  tasks.push({
    className: 'SortTask',
    fullName: 'SortTask',
    flowType: 'playground',
  });
  tasks.push({
    className: 'DeepAssignTask',
    fullName: 'DeepAssignTask',
    flowType: 'playground',
  });
  tasks.push({
    className: 'ExtractUniqueTask',
    fullName: 'ExtractUniqueTask',
    flowType: 'playground',
  });
  tasks.push({
    className: 'FilterTask',
    fullName: 'FilterTask',
    flowType: 'playground',
  });
  tasks.push({
    className: 'CountTask',
    fullName: 'CountTask',
    flowType: 'playground',
  });
  tasks.push({
    className: 'CustomCodeTask',
    fullName: 'CustomCodeTask',
    flowType: 'playground',
  });

  tasks.push({
    className: 'ScreenTask',
    fullName: 'ScreenTask',
    flowType: 'playground',
  });
  tasks.push({
    className: 'FormTask',
    fullName: 'FormTask',
    flowType: 'playground',
  });
  return tasks;
}

function saveFlow(flowId: string, flow: any) {
  const flowPackage = {
    flow: flow,
    name: flowId,
    id: flowId,
    flowType: 'playground',
  };
  localStorage.setItem('flow-' + flowId, JSON.stringify(flowPackage));
}

function setSelectedFlow(flowName: string) {
  localStorage.setItem('selected-flow', flowName);
}

function getSelectedFlow() {
  return localStorage.getItem('selected-flow') || 'flow';
}

function storeFlowPackage(flowPackage: any) {
  if (flowPackage) {
    saveFlow(getSelectedFlow(), flowPackage.flow);
  }
  localStorage.setItem('flowPackage', JSON.stringify(flowPackage));
}
function getFlowPackage() {
  var packageAsString = localStorage.getItem('flowPackage');
  if (packageAsString) {
    return JSON.parse(packageAsString);
  }
  return {
    dummy: '',
    flow: [],
    layout: '{}',
    selectedNode: {},
    selectedFlow: 'flow',
  };
}

function getFlows() {
  var flowsAsString = localStorage.getItem('flows');
  if (flowsAsString) {
    return JSON.parse(flowsAsString);
  }
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
  var flowAsString = localStorage.getItem('flow-' + flowId);
  if (flowAsString) {
    return JSON.parse(flowAsString);
  }
  return [];
}

export const flowrunnerStorageProvider: IStorageProvider = {
  storeFlowPackage: storeFlowPackage,
  getFlowPackage: getFlowPackage,
  getFlows: getFlows,
  getFlow: getFlow,
  saveFlow: saveFlow,
  setSelectedFlow: setSelectedFlow,
  getSelectedFlow: getSelectedFlow,
  getTasks: getTasks,
  getApiProxyUrl: () => {
    return '';
  },
  addFlow: (name, flow) => {},
  isUI: false,
};
