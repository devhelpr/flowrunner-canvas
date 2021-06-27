import { IStorageProvider } from './interfaces/IStorageProvider';

function exampleFlow() {
  return `{
    "flow": [{
      "id": "DebugTask",
      "x": 1197.5626930952271,
      "y": 432.5504263215948,
      "shapeType": "Rect",
      "name": "DebugTask",
      "taskType": "DebugTask",
      "htmlPlugin": "debugNode",
      "visualizer": "number",
      "propertyName": "output",
      "format": "toFixed",
      "fixed": 0,
      "decimalSeparator": ",",
      "afterLabel": ""
    }, {
      "name": "connection-7b295792-eed8-4316-a562-84bd2d9f5606",
      "taskType": "connection",
      "shapeType": "Line",
      "startshapeid": "AssignTask",
      "endshapeid": "DebugTask",
      "xstart": 283.6746023460453,
      "ystart": 575.8035178774392,
      "xend": 879.7005148086968,
      "yend": 374.27396264530074,
      "thumbPosition": 0
    }, {
      "id": "FormTask",
      "x": 41.41221093055174,
      "y": 328.23075055847556,
      "shapeType": "Rect",
      "name": "FormTask",
      "taskType": "FormTask",
      "metaInfo": [{
        "fieldName": "radiobuttonExample",
        "fieldType": "radiobutton",
        "options": [{
          "value": "option1",
          "label": "Show input fields"
        }, {
          "value": "option2",
          "label": "Follow unhappy-flow"
        }]
      }, {
        "fieldName": "value1",
        "fieldType": "text",
        "label": "Value 1",
        "visibilityCondition": "radiobuttonExample=='option1'"
      }, {
        "fieldName": "value2",
        "fieldType": "text",
        "label": "Value 2",
        "visibilityCondition": "radiobuttonExample=='option1'"
      }]
    }, {
      "id": "IfConditionTask",
      "x": 432.02819033634046,
      "y": 285.9962303873352,
      "shapeType": "Diamond",
      "name": "IfConditionTask",
      "taskType": "IfConditionTask",
      "compareProperty": "radiobuttonExample",
      "withProperty": "",
      "withValue": "option1",
      "usingCondition": "equals",
      "dataType": "string",
      "dontTriggerOnEmptyValues": true
    }, {
      "name": "connection-fc775d4b-d28a-41db-bc7b-2614d424789b",
      "taskType": "connection",
      "shapeType": "Line",
      "startshapeid": "FormTask",
      "endshapeid": "IfConditionTask",
      "xstart": 191.41221093055174,
      "ystart": 248.23075055847556,
      "xend": 424.02819033634046,
      "yend": 365.9962303873352,
      "thumbPosition": 0
    }, {
      "id": "DebugTask1",
      "x": 630.3220057562881,
      "y": 794.241688537996,
      "shapeType": "Rect",
      "name": "DebugTask1",
      "taskType": "DebugTask",
      "htmlPlugin": "debugNode",
      "visualizer": "text",
      "propertyName": "radiobuttonExample",
      "format": "toFixed",
      "fixed": 2,
      "decimalSeparator": ",",
      "afterLabel": ""
    }, {
      "name": "connection-145ae7c6-7d0d-4db3-b152-83c384600476",
      "taskType": "connection",
      "shapeType": "Line",
      "startshapeid": "IfConditionTask",
      "endshapeid": "DebugTask1",
      "xstart": 512.0281903363405,
      "ystart": 445.9962303873352,
      "xend": 497.32200575628815,
      "yend": 721.241688537996,
      "thumbPosition": 2,
      "followflow": "onfailure"
    }, {
      "name": "ExpressionTask",
      "id": "ExpressionTask",
      "taskType": "ExpressionTask",
      "shapeType": "Rect",
      "x": 770.2693022623774,
      "y": 230.0589199850804,
      "expression": "value1 + value2",
      "assignToProperty": "output",
      "forceNumeric": true,
      "htmlPlugin": "formNode",
      "mode": "numeric"
    }, {
      "name": "connection-c009dfbc-eb27-4e84-a51e-34dd67edfc58",
      "taskType": "connection",
      "shapeType": "Line",
      "startshapeid": "IfConditionTask",
      "endshapeid": "ExpressionTask",
      "xstart": 512.0281903363405,
      "ystart": 285.9962303873352,
      "xend": 612.2693022623774,
      "yend": 150.0589199850804,
      "thumbPosition": 1,
      "followflow": "onsuccess"
    }, {
      "name": "connection-fcca016b-cb22-49b8-93ce-dbd4ea867829",
      "taskType": "connection",
      "shapeType": "Line",
      "startshapeid": "ExpressionTask",
      "endshapeid": "DebugTask",
      "xstart": 920.2693022623774,
      "ystart": 150.0589199850804,
      "xend": 1064.5626930952271,
      "yend": 359.5504263215948,
      "thumbPosition": 0
    }],
    "name": "flow",
    "id": "flow",
    "flowType": "playground"
  }`;
}

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
  return JSON.parse(exampleFlow());
  /*
  return {
    dummy: '',
    flow: [],
    layout: '{}',
    selectedNode: {},
    selectedFlow: 'flow',
  };
  */
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
  return JSON.parse(exampleFlow());
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
