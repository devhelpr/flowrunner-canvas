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

const customConfig = {};

const taskTypeConfig: any = {
  _variable: {
    ...variableAttached,
  },
  AssignTask: {
    icon: 'fa-cube',
    shapeType: 'Html',
    htmlPlugin: 'formNode',
    metaInfo: [
      {
        fieldName: 'assignToProperty',
        required: true,
      },
      {
        fieldName: 'value',
      },
      {
        fieldName: 'valueFromProperty',
      },
    ],
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
    _label: '{compareProperty} {usingCondition} {withProperty}{withValue}',
    label:
      '{compareProperty} {usingCondition=>"equals":"=","not-equals":"<>","smaller":"<","smaller-or-equal":"<=","bigger-or-equal":">=","bigger":">","default":""} {withProperty|withValue}',
  },
  if: {
    shapeType: 'Diamond',
    _label: '{compareProperty} {usingCondition} {withProperty}{withValue}',
    label:
      'value {condition=>"eq":"=","not-equals":"<>","lower":"<","lowereq":"<=","bigger-or-equal":">=","bigger":">","default":""} {valueInt}',
  },
  InjectIntoPayloadTask: {
    icon: 'fa-cubes',
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
    shapeType: 'Html',
    htmlPlugin: 'formNode',
    metaInfo: [
      {
        fieldName: 'functionnodeid',
        required: true,
      },
    ],
    presetValues: {
      functionnodeid: '',
    },
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
    icon: 'fa-globe',
    shapeType: 'Rect',
    isSkewed: true,
    presetValues: {
      url: '',
      method: 'get',
    },
  },
  ExpressionTask: {
    shapeType: 'Html',
    icon: 'fa-calculator',
    presetValues: {
      expression: '',
      assignToProperty: '',
      forceNumeric: true,
    },
    htmlPlugin: 'formNode',
    metaInfo: [
      {
        fieldName: 'expression',
        required: true,
      },
      {
        fieldName: 'assignToProperty',
        required: true,
      },
      ,
      {
        fieldName: 'mode',
        fieldType: 'select',
        options: [
          {
            value: 'default',
            label: 'Default',
          },
          {
            value: 'numeric',
            label: 'Numeric',
          },
        ],
      },
    ],
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
  ValidateModelTask: {
    shapeType: 'Diamond',
  },
  PreviewTask: {
    hasUI: true,
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
  RunWasmFlowTask: {
    hasUI: false,
    shapeType: 'Html',
    htmlPlugin: 'formNode',
    metaInfo: [
      {
        fieldName: 'flowId',
        fieldType: 'select',
        required: true,
        datasource: '[WASMFLOW]',
      },
    ],
    presetValues: {
      flow: [],
    },
  },
  RunFlowTask: {
    hasUI: false,
    shapeType: 'Html',
    htmlPlugin: 'formNode',
    metaInfo: [
      {
        fieldName: 'flowId',
        fieldType: 'select',
        required: true,
        datasource: '[PLAYGROUNDFLOW]',
      },
      {
        fieldName: 'nodeName',
        required: true,
      },
    ],
    presetValues: {},
  },
  GridEditTask: {
    hasUI: true,
    shapeType: 'Html',
    htmlPlugin: 'gridEditNode',
    presetValues: {
      htmlPlugin: 'gridEditNode',
      propertyName: '',
    },
  },
  FilterDataGridTask: {
    shapeType: 'Html',
    htmlPlugin: 'formNode',
    icon: 'fa-filter',
    metaInfo: [
      {
        fieldName: 'filterColumn',
        required: true,
      },
      {
        fieldName: 'filterValueFromProperty',
        required: true,
      },
      {
        fieldName: 'namespace',
        required: true,
      },
    ],
    presetValues: {},
  },
  SearchDataGridTask: {
    shapeType: 'Html',
    htmlPlugin: 'formNode',
    icon: 'fa-search',
    metaInfo: [
      {
        fieldName: 'searchColumn',
        required: true,
      },
      {
        fieldName: 'searchValueFromProperty',
        required: true,
      },
      {
        fieldName: 'outputProperty',
        required: true,
      },
      {
        fieldName: 'outputColumn',
        required: true,
      },
      {
        fieldName: 'namespace',
        required: true,
      },
    ],
    presetValues: {},
  },
  DataGridTask: {
    shapeType: 'Html',
    htmlPlugin: 'dataGridNode',
    icon: 'fa-table',
    presetValues: {
      htmlPlugin: 'dataGridNode',
      propertyName: '',
      rows: 2,
      columns: 2,
      values: [
        ['0', '0'],
        ['0', '0'],
      ],
    },
  },
  SliderTask: {
    hasUI: true,
    hasConfigMenu: true,
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
    configMenu: {
      fields: [
        { fieldName: 'propertyName', required: true },
        { fieldName: 'title' },
        { fieldName: 'defaultValue', dataType: 'number' },
        { fieldName: 'minValue', dataType: 'number' },
        { fieldName: 'maxValue', dataType: 'number' },
      ],
    },
    events: [
      {
        eventName: 'onChange',
      },
    ],
  },
  TimerTask: {
    icon: 'fa-clock',
    events: [
      {
        eventName: 'onTimer',
      },
    ],
  },
  matrix: {
    shapeType: 'Html',
    htmlPlugin: 'formNode',
    metaInfo: [
      {
        fieldName: 'name',
        required: true,
        isNodeId: true,
      },
    ],
  },
  MatrixTask: {
    events: [
      {
        eventName: 'onCalculateNewGenerationForEachCell',
      },
    ],
    shapeType: 'Html',
    htmlPlugin: 'formNode',
    metaInfo: [
      {
        fieldName: 'action',
        required: true,
      },
      {
        fieldName: 'flowId',
        fieldType: 'select',
        required: true,
        datasource: '[WASMFLOW]',
      },
    ],
  },
  InputTask: {
    hasUI: true,
    shapeType: 'Html',
    htmlPlugin: 'inputNode',
    hasConfigMenu: true,
    configMenu: {
      fields: [{ fieldName: 'propertyName' }],
    },
  },
  ScreenTask: {
    hasUI: false,
    shapeType: 'Html',
    htmlPlugin: 'formNode',
    metaInfo: [
      {
        fieldName: 'action',
        required: true,
      },
      {
        fieldName: 'titleBarBackgroundcolor',
        fieldType: 'color',
      },
      {
        fieldName: 'titleBarColor',
        fieldType: 'color',
      },
    ],
  },
  FormTask: {
    hasUI: true,
    shapeType: 'Html',
    htmlPlugin: 'formNode',
    hasMetaInfoInNode: true,
    presetValues: {
      metaInfo: [],
    },
  },
  DebugTask: {
    shapeType: 'Html',
    hasUI: true,
    hasConfigMenu: true,
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
    configMenu: {
      fields: [
        {
          fieldName: 'visualizer',
          fieldType: 'select',
          options: [
            {
              value: 'number',
              label: 'number',
            },
            {
              value: 'text',
              label: 'text',
            },
            {
              value: 'color',
              label: 'color',
            },
            {
              value: 'gridcanvas',
              label: 'gridcanvas',
            },
            {
              value: 'xycanvas',
              label: 'xycanvas',
            },
            {
              value: 'children',
              label: 'children',
            },
            {
              value: 'json',
              label: 'json',
            },
          ],
        },
        { fieldName: 'propertyName' },
        { fieldName: 'format' },
        { fieldName: 'fixed', dataType: 'number' },
        { fieldName: 'decimalSeparator' },
        { fieldName: 'afterLabel' },
        { fieldName: 'rows', dataType: 'number' },
        { fieldName: 'columns', dataType: 'number' },
        { fieldName: 'mode', defaultValue: 'matrix' },
      ],
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
  },
  RouteEndpointTask: {
    shapeType: 'Html',
    htmlPlugin: 'formNode',
    presetValues: {
      url: '',
      isStartEnd: true,
    },
    metaInfo: [
      {
        fieldName: 'url',
        required: true,
      },
    ],
  },
};

let fullConfig = { ...taskTypeConfig };

export const setCustomConfig = (className: string, config: any) => {
  if (config) {
    customConfig[className] = config;
  }
  fullConfig = getTaskConfig();
};

export const getTaskConfig = () => {
  return { ...taskTypeConfig, ...customConfig };
};

export const getTaskConfigForTask = className => {
  return fullConfig[className] || {};
};
