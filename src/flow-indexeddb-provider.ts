import { IStorageProvider } from './interfaces/IStorageProvider';
import * as uuid from 'uuid';
const uuidV4 = uuid.v4;
let defaultflowId = '00000000-0000-0000-0000-000000000000';

let defaultFlow = '';
let defaultFlowTitle = 'Example flow';
let additionalTasks: any[] = [];

interface ITransaction {
  flowId: string;
  flow: any[];
  name: string;
}

let isProcessing = false;
let transactions: ITransaction[] = [];

function storeTransaction(store: IDBObjectStore, transaction: ITransaction) {
  const objectRequest = store.put(
    {
      flow: transaction?.flow,
      flowId: transaction?.flowId,
      name: transaction?.name,
    },
    transaction?.flowId,
  );

  objectRequest.onerror = function(event) {
    console.log('handleTransactions error', event);
  };

  objectRequest.onsuccess = function(event) {
    if (objectRequest.result) {
      isProcessing = false;
      handleTransactions();
    } else {
      console.log('handleTransactions error in  onsuccess', event);
    }
  };
}

function handleTransactions() {
  console.log('handleTransactions', isProcessing, transactions.length, database);

  if (!isProcessing && transactions.length > 0 && database) {
    isProcessing = true;
    const transaction = transactions.shift();
    if (!transaction) {
      console.log('No transaction in handleTransactions');
      return;
    }
    let tx = database.transaction([flowStoreName], 'readwrite');
    let store = tx.objectStore(flowStoreName);

    var getRequest = store.get(transaction?.flowId);

    getRequest.onerror = function(event) {
      storeTransaction(store, transaction);
    };

    getRequest.onsuccess = function(event) {
      if (getRequest.result) {
        transaction.name = getRequest.result.name;
      }
      storeTransaction(store, transaction);
    };
  }
}

function exampleFlow() {
  if (defaultFlow !== '') {
    return defaultFlow;
  }

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
      "x": 1129.1488151297847,
      "y": 902.0867810989434,
      "shapeType": "Rect",
      "name": "DebugTask1",
      "taskType": "DebugTask",
      "htmlPlugin": "debugNode",
      "visualizer": "text",
      "propertyName": "text",
      "format": "toFixed",
      "fixed": 2,
      "decimalSeparator": ",",
      "afterLabel": ""
    }, {
      "name": "ExpressionTask",
      "id": "ExpressionTask",
      "taskType": "ExpressionTask",
      "shapeType": "Rect",
      "x": 770.2693022623774,
      "y": 230.0589199850804,
      "expression": "value1 * value2",
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
    }, {
      "name": "AssignTask",
      "id": "AssignTask",
      "taskType": "AssignTask",
      "shapeType": "Rect",
      "x": 576.9339773382222,
      "y": 905.1561766548424,
      "assignToProperty": "text",
      "value": "Hello Flow",
      "htmlPlugin": "formNode"
    }, {
      "name": "connection-79ee92bf-c1ec-4967-9be3-790f5ebef2d6",
      "taskType": "connection",
      "shapeType": "Line",
      "startshapeid": "IfConditionTask",
      "endshapeid": "AssignTask",
      "xstart": 512.0281903363405,
      "ystart": 445.9962303873352,
      "xend": 418.93397733822223,
      "yend": 825.1561766548424,
      "thumbPosition": 2,
      "followflow": "onfailure"
    }, {
      "name": "connection-d007a5c3-baf3-4861-a961-5513cb0228aa",
      "taskType": "connection",
      "shapeType": "Line",
      "startshapeid": "AssignTask",
      "endshapeid": "DebugTask1",
      "xstart": 726.9339773382222,
      "ystart": 825.1561766548424,
      "xend": 996.1488151297847,
      "yend": 829.0867810989434,
      "thumbPosition": 0
    }],
    "name": "flow",
    "id": "flow",
    "flowType": "playground"
  }`;
}

let tasks = [
  {
    className: 'AssignTask',
    fullName: 'AssignTask',
    flowType: 'playground',
  },
  {
    className: 'IfConditionTask',
    fullName: 'IfConditionTask',
    flowType: 'playground',
  },
  {
    className: 'DebugTask',
    fullName: 'DebugTask',
    flowType: 'playground',
  },
  {
    className: 'ExpressionTask',
    fullName: 'ExpressionTask',
    flowType: 'playground',
  },
  {
    className: 'FormTask',
    fullName: 'FormTask',
    flowType: 'playground',
  },
];

function getTasks() {
  return [...tasks, ...additionalTasks];
}

function saveFlow(flowId: string, flow: any) {
  console.log('Saving flow', flowId, flow);
  const flowPackage = {
    flow: flow,
    name: flowId,
    id: flowId,
    flowType: 'playground',
  };
  //localStorage.setItem('flow-' + flowId, JSON.stringify(flowPackage));

  transactions.push({
    flowId,
    flow,
    name: `Flow ${flowId}`,
  });
  console.log('Saving flow', transactions);
  handleTransactions();
}

function setSelectedFlow(flowName: string) {
  //localStorage.setItem('selected-flow', flowName);
}

function getSelectedFlow() {
  return 'flow'; //localStorage.getItem('selected-flow') || 'flow';
}

function storeFlowPackage(flowPackage: any) {
  if (flowPackage) {
    saveFlow(getSelectedFlow(), flowPackage.flow);
  }
  //localStorage.setItem('flowPackage', JSON.stringify(flowPackage));
}
function getFlowPackage() {
  var packageAsString = localStorage.getItem('flowPackage');
  if (packageAsString) {
    return JSON.parse(packageAsString);
  }
  return JSON.parse(getDefaultFlow());
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

function getDefaultFlows() {
  return [
    {
      fileName: 'flow.json',
      name: 'flow',
      id: 'flow',
      flowType: 'playground',
    },
  ];
}
function getFlows() {
  console.log('getFlows');
  return new Promise<any>((resolve, reject) => {
    if (!database) {
      reject('No database');
      return;
    }

    var transaction = database.transaction([flowStoreName]);
    var objectStore = transaction.objectStore(flowStoreName);
    var objectRequest = objectStore.getAll();

    objectRequest.onerror = function(event) {
      reject(Error('Error text'));
    };

    objectRequest.onsuccess = function(event) {
      if (objectRequest.result) {
        console.log('getall', objectRequest.result);
        if (objectRequest.result.length > 0) {
          resolve(
            objectRequest.result.map(item => {
              return {
                name: item.name,
                id: item.flowId,
              };
            }),
          );
        } else {
          resolve([
            {
              id: defaultflowId,
              name: defaultFlowTitle,
            },
          ]);
        }
      } else reject(Error('object not found'));
    };
    /*
    var flowAsString = localStorage.getItem('flow-' + flowId);
    if (flowAsString) {
      resolve(JSON.parse(flowAsString));
    }
    resolve(JSON.parse(getDefaultFlow()));
    */
  });
} /*
  var flowsAsString = localStorage.getItem('flows');
  if (flowsAsString) {
    return JSON.parse(flowsAsString);
  }
  return getDefaultFlows();
}
*/

function getDefaultFlow() {
  return exampleFlow();
}

function getFlow(flowId: string) {
  return new Promise<any>((resolve, reject) => {
    if (!database) {
      reject('No database');
      return;
    }

    var transaction = database.transaction([flowStoreName]);
    var objectStore = transaction.objectStore(flowStoreName);
    var objectRequest = objectStore.get(flowId);

    objectRequest.onerror = function(event) {
      reject(Error('Error text'));
    };

    objectRequest.onsuccess = function(event) {
      if (objectRequest.result) {
        resolve({
          flow: objectRequest.result.flow,
          flowType: 'playground',
          id: 'flow',
          name: 'flow',
        });
      } else {
        transactions.push({
          flowId: defaultflowId,
          flow: JSON.parse(getDefaultFlow()).flow,
          name: defaultFlowTitle,
        });

        resolve({
          flow: JSON.parse(getDefaultFlow()).flow,
          flowType: 'playground',
          id: defaultflowId,
          name: defaultFlowTitle,
        });
      }
    };
    /*
    var flowAsString = localStorage.getItem('flow-' + flowId);
    if (flowAsString) {
      resolve(JSON.parse(flowAsString));
    }
    resolve(JSON.parse(getDefaultFlow()));
    */
  });
}

function addFlow(name, flow) {
  return new Promise((resolve, reject) => {
    if (!database) {
      reject();
      return;
    }
    let tx = database.transaction([flowStoreName], 'readwrite');
    let store = tx.objectStore(flowStoreName);

    let flowId = uuidV4();

    const objectRequest = store.put(
      {
        flow: flow,
        flowId: flowId,
        name: name,
      },
      flowId,
    );

    objectRequest.onerror = function(event) {
      console.log('handleTransactions error', event);
    };

    objectRequest.onsuccess = function(event) {
      if (objectRequest.result) {
        isProcessing = false;
        resolve({ id: flowId });
      } else {
        reject();
      }
    };
  });
}

export const setDefaultFlowTitle = (title: string) => {
  defaultFlowTitle = title;
};

export const setDefaultFlow = (id, flow: any[]) => {
  defaultFlow = JSON.stringify({
    flow: flow,
    name: id,
    flowType: 'playground',
    id: id,
  });
};

export const setAdditionalTasks = (tasks: any[]) => {
  additionalTasks = tasks;
};

export const setTasks = (setupTasks: any[]) => {
  tasks = setupTasks;
};

export const flowrunnerIndexedDbStorageProvider: IStorageProvider = {
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
  addFlow: addFlow,
  isUI: false,
  isReadOnly: false,
  canStoreMultipleFlows: true,
  isAsync: true,
};

let database: IDBDatabase | null = null;

const flowStoreDBName = 'flowrunner-flow-store';
const flowStoreName = 'flowStore';

export const createIndexedDBStorageProvider = () => {
  return new Promise<IStorageProvider>((resolve, reject) => {
    let idb = window.indexedDB;

    let dbRequest = idb.open(flowStoreDBName, 1);

    if (!dbRequest) {
      reject(new Error('createIndexedDBStorageProvider failed'));
    }

    dbRequest.onupgradeneeded = function(event) {
      if (!event || !event.target || !(event.target as any).result) {
        reject(new Error('No event target'));
      }

      database = (event.target as any).result as IDBDatabase;
      var objectStore = database.createObjectStore(flowStoreName, {
        autoIncrement: true,
      });
    };

    dbRequest.onsuccess = event => {
      if (!event || !event.target || !(event.target as any).result) {
        reject(new Error('No event target'));
      }
      database = (event.target as any).result as IDBDatabase;

      resolve(flowrunnerIndexedDbStorageProvider);
    };

    dbRequest.onerror = event => {
      reject();
    };
  });
};
