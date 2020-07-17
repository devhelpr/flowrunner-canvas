const stateTypeTask = {
  shapeType: 'Circle',
  strokeColor: '#0080e0',
  fillColor: '#34a5fa',
  fillSelectedColor: '#065c9d',
  textColor: '#ffffff',
};

const actionTask = {
  strokeColor: '#f78306',
  fillColor: '#f7a145',
  fillSelectedColor: '#ce791f',
  textColor: '#000000',
};

const variableAttached = {
  strokeColor: '#0080e0',
  fillColor: '#34a5fa',
  fillSelectedColor: '#065c9d',
  textColor: '#ffffff',
};

const customConfig = {

};


const taskTypeConfig: any = {
  _variable: {
    ...variableAttached,
  },
  AssignTask: {
    shapeType: 'Rect',
    presetValues: {
      assignToProperty: '',
      value: '',
    },
  },
  IfConditionTask: {
    shapeType: 'Diamond',
    presetValues: {
      compareProperty: '',
      withProperty: '',
      withValue: '',
      usingCondition: 'equals, not-equals, smaller, bigger, smaller-or-equal, bigger-or-equal',
      dataType: 'string',
    },
  },
  InjectIntoPayloadTask: {
    shapeType: 'Rect',
    layout: {
      strokeColor: '#d61bd8',
      fillColor: '#d550d7',
      fillSelectedColor: '#d32cd5',
      textColor: '#ffffff',
    },
    presetValues: {
      object: {},
    },
  },
  ClearTask: {
    shapeType: 'Rect',
  },
  TraceConsoleTask: {
    shapeType: 'Circle',
  },
  FunctionCallTask: {
    cornerRadius: 10,
  },
  FunctionInputTask: {
    isStartEnd: true,
  },
  FetchTask: {
    shapeType: 'Rect',
    isSkewed: true,
    presetValues: {
      url: '',
      method: 'get',
    },
  },
  ApiProxyTask: {
    shapeType: 'Rect',
    isSkewed: true,
    presetValues: {
      url: '',
      method: 'get',
    },
  },
  ExpressionTask: {
    shapeType: 'Rect',
    presetValues: {
      expression: '',
      assignToProperty: '',
      forceNumeric: true,
    },
  },
  ObservableTask: {
    strokeColor: '#510a24',
    fillColor: '#d81b60',
    fillSelectedColor: '#921241',
    textColor: '#ffffff',
    presetValues: {
      observeProperty: '',
    },
  },
  ObserverTask: {
    strokeColor: '#510a24',
    fillColor: '#d81b60',
    fillSelectedColor: '#921241',
    textColor: '#ffffff',
    presetValues: {
      observe: '[name of observable node to observe]',
    },
  },
  RouteEndpointTask: {
    presetValues: {
      url: '',
      isStartEnd: true,
    },
  },
  ValidateModelTask: {
    shapeType: 'Diamond',
  },
  PreviewTask: {
    shapeType: 'Html',
    presetValues: {
      htmlPlugin: '[executeNode,inputNode,sliderNode]',
    },
  },
  ConditionalTriggerTask: {
    shapeType: 'Diamond',
    presetValues: {
      propertyName: '',
      minValue: -1,
      maxValue: -1,
    },
  },
  OutputValueTask: {
    shapeType: 'Rect',
    presetValues: {
      propertyName: 'outputValue',
      startValue: 0,
      maxValue: 100,
      increment: 1,
    },
  },
  SliderTask: {
    shapeType: 'Html',
    htmlPlugin: 'sliderNode',
    presetValues: {
      htmlPlugin: 'sliderNode',
      propertyName: '',
      maxValue: 100,
      onChange: '',
      title: '',
      preLabel: '',
      afterLabel: '',
      defaultValue: 50,
    },
    events: [
      {
        "eventName" : "onChange"
      }
    ]
  },
  TimerTask: {
    events: [
      {
        "eventName" : "onTimer"
      }
    ]
  },
  MatrixTask: {
    events: [
      {
        "eventName" : "onCalculateNewGenerationForEachCell"
      }
    ]
  },
  InputTask: {
    shapeType: 'Html',
    htmlPlugin: 'inputNode',
  },
  DebugTask: {
    shapeType: 'Html',
    htmlPlugin: 'debugNode',
    presetValues: {
      htmlPlugin: 'debugNode',
      visualizer: '',
      propertyName: '',
      format: 'toFixed',
      fixed: 2,
      decimalSeparator: ',',
      afterLabel: '',
    },
  },
  ReduxArrayStateType: {
    ...stateTypeTask,
    presetValues: {
      subtype: 'registrate',
      variableName: '',
    },
  },
  ReduxPropertyStateType: {
    ...stateTypeTask,
    presetValues: {
      subtype: 'registrate',
      variableName: '',
    },
  },
  ReduxHashmapStateType: {
    ...stateTypeTask,
    presetValues: {
      subtype: 'registrate',
      variableName: '',
    },
  },
  ReduxActionTask: {
    ...actionTask,
    presetValues: {
      setVariable: '',
    },
  },
  ReduxAssignArrayActionTask: actionTask,
  ReduxSetItemByKeyArrayActionTask: actionTask,
  ReduxClearArrayActionTask: actionTask,
  ReduxGetKeyTask: actionTask,
  ReduxGetTask: {
    ...actionTask,
    presetValues: {
      getVariable: '',
      assignTo: '',
    },
  },
  ReduxPushArrayActionTask: actionTask,
  ModelTask: {
    shapeType: 'Rect',
    subShapeType: 'Model',
    presetValues: {
      modelName: '',
      primaryKeyFieldName: '[Field to use as visible text (not the id field)]',
      fields: [
        {
          fieldName: '',
        },
      ],
    },
  }
};

let fullConfig = {...taskTypeConfig};

export const setCustomConfig = (className : string, config : any) => {
  if (config) {
    customConfig[className] = config;
  }
  fullConfig = getTaskConfig();
}

export const getTaskConfig = () => {
  return {...taskTypeConfig, ...customConfig};
}

export const getTaskConfigForTask = (className) => {
  return fullConfig[className] || {};
}
