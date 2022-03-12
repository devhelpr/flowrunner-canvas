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
    _background: 'background-yellow',
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
      usingCondition: 'equals',
      dataType: 'string',
      dontTriggerOnEmptyValues: true,
    },
    _label: '{compareProperty} {usingCondition} {withProperty}{withValue}',
    label:
      '{compareProperty} {usingCondition=>"equals":"==","not-equals":"<>","smaller":"<","smaller-or-equal":"<=","bigger-or-equal":">=","bigger":">","default":""} "{withProperty|withValue}"',
    hasConfigMenu: true,
    configMenu: {
      fields: [
        { fieldName: 'compareProperty', required: true },
        { fieldName: 'withProperty' },
        { fieldName: 'withValue' },
        {
          fieldName: 'usingCondition',
          fieldType: 'select',
          options: [
            {
              label: 'equals',
              value: 'equals',
            },
            {
              label: 'not-equals',
              value: 'not-equals',
            },
            {
              label: 'smaller',
              value: 'smaller',
            },
            {
              label: 'bigger',
              value: 'bigger',
            },
            {
              label: 'smaller-or-equal',
              value: 'smaller-or-equal',
            },
            {
              label: 'bigger-or-equal',
              value: 'bigger-or-equal',
            },
          ],
        },
        {
          fieldName: 'dataType',
          fieldType: 'select',
          options: [
            {
              label: 'string',
              value: 'string',
            },
            {
              label: 'number',
              value: 'number',
            },
          ],
        },
      ],
    },
  },
  WhileTask: {
    shapeType: 'Diamond',
    subShapeType: 'Loop',
    altThumbPositions: 1,
    presetValues: {
      compareProperty: '',
      withProperty: '',
      withValue: '',
      usingCondition: 'equals',
      dataType: 'string',
      dontTriggerOnEmptyValues: true,
    },
    _label: '{compareProperty} {usingCondition} {withProperty}{withValue}',
    label:
      '{compareProperty} {usingCondition=>"equals":"==","not-equals":"<>","smaller":"<","smaller-or-equal":"<=","bigger-or-equal":">=","bigger":">","default":""} "{withProperty|withValue}"',
    hasConfigMenu: true,
    configMenu: {
      fields: [
        { fieldName: 'compareProperty', required: true },
        { fieldName: 'withProperty' },
        { fieldName: 'withValue' },
        {
          fieldName: 'usingCondition',
          fieldType: 'select',
          options: [
            {
              label: 'equals',
              value: 'equals',
            },
            {
              label: 'not-equals',
              value: 'not-equals',
            },
            {
              label: 'smaller',
              value: 'smaller',
            },
            {
              label: 'bigger',
              value: 'bigger',
            },
            {
              label: 'smaller-or-equal',
              value: 'smaller-or-equal',
            },
            {
              label: 'bigger-or-equal',
              value: 'bigger-or-equal',
            },
          ],
        },
        {
          fieldName: 'dataType',
          fieldType: 'select',
          options: [
            {
              label: 'string',
              value: 'string',
            },
            {
              label: 'number',
              value: 'number',
            },
          ],
        },
      ],
    },
  },
  if: {
    shapeType: 'Diamond',
    _label: '{compareProperty} {usingCondition} {withProperty}{withValue}',
    label:
      'value {condition=>"eq":"=","not-equals":"<>","lower":"<","lowereq":"<=","bigger-or-equal":">=","bigger":">","default":""} {valueInt}',
  },
  InjectIntoPayloadTask: {
    icon: 'fa-cubes',
    shapeType: 'Html',
    htmlPlugin: 'shapeNode',
    layout: {
      strokeColor: '#d61bd8',
      fillColor: '#d550d7',
      fillSelectedColor: '#d32cd5',
      textColor: '#ffffff',
    },
    presetValues: {
      object: {},
    },
    style: {
      borderRadius: '40px',
      border: '2px solid purple',
    },
    styleShapeBody: {
      width: '200px',
      height: '200px',
    },
    width: 200,
    height: 200,
    config: {
      objects: [
        {
          id: '202809c7-964a-43a1-a590-57a93346d875',
          imageUrl: '/media/earth.jpg',
          css: 'tw-h-full tw-w-full tw-object-fit',
        },
        {
          id: 'c103357a-b150-4f27-8ec5-da2d179bb331',
          iconSpec: 'far fa-smile',
          css: 'tw-absolute tw-top-1/2 tw-left-1/2 -tw-translate-x-1/2 -tw-translate-y-1/2 tw-text-white tw-h-auto',
        },
      ],
    },
  },
  ClearTask: {
    shapeType: 'Rect',
  },
  TraceConsoleTask: {
    shapeType: 'Circle',
  },
  FunctionCallTask: {
    background: 'background-dark-yellow',
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
    _isStartEnd: true,
    background: 'background-yellow',
    constraints: {
      input: {
        allowedInputs: 0,
        notAllowed: [],
        allowed: [],
      },
    },
  },
  FunctionOutputTask: {
    background: 'background-yellow',
    constraints: {
      output: {
        allowedOutputs: 0,
        notAllowed: [],
        allowed: [],
      },
    },
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
      sendPayloadToApi: false,
    },
  },
  CustomCodeTask: {
    shapeType: 'Html',
    icon: 'fa-code',
    presetValues: {
      expression: '',
      assignToProperty: '',
      forceNumeric: true,
    },
    htmlPlugin: 'formNode',
    metaInfo: [
      {
        fieldName: 'code',
        required: true,
      },
      {
        fieldName: 'outputProperty',
        required: true,
      },
      {
        fieldName: 'mode',
        fieldType: 'select',
        options: [
          {
            value: 'custom',
            label: 'Custom',
          },
          {
            value: 'matrix',
            label: 'Matrix',
          },
        ],
      },
    ],
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
    showNotSelectedAsLabels: true,
    metaInfo: [
      {
        fieldName: 'expression',
        required: true,
      },
      {
        fieldName: 'assignToProperty',
        required: true,
      },
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
    altThumbPositions: 1,
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
    hasConfigMenu: true,
    configMenu: {
      fields: [
        {
          fieldName: 'interval',
          required: true,
          label: 'Interval(ms)',
          dataType: 'number',
        },
        {
          fieldName: 'mode',
          fieldType: 'select',
          options: [
            { label: 'default', value: 'default' },
            { label: 'executeNode', value: 'executeNode' },
          ],
        },
        {
          fieldName: 'executeNode',
          visibilityCondition: 'mode="executeNode"',
        },
      ],
    },
  },
  CountTask: {
    icon: 'fa-calculator',
    shapeType: 'Html',
    htmlPlugin: 'formNode',
    metaInfo: [
      {
        fieldName: 'arrayProperty',
        required: true,
      },
      {
        fieldName: 'outputProperty',
        required: true,
      },
    ],
    presetValues: {
      arrayProperty: '',
      outputProperty: '',
    },
  },
  ExtractUniqueTask: {
    icon: 'fa-fingerprint',
    shapeType: 'Html',
    htmlPlugin: 'formNode',
    metaInfo: [
      {
        fieldName: 'sourceProperty',
        required: true,
      },
      {
        fieldName: 'outputProperty',
        required: true,
      },
      {
        fieldName: 'extractFromProperty',
      },
      {
        fieldName: 'isOutputForDropdown',
        fieldType: 'checkbox',
      },
    ],
    presetValues: {
      sortProperty: '',
      outputProperty: '',
    },
  },
  FilterTask: {
    icon: 'fa-filter',
    shapeType: 'Html',
    htmlPlugin: 'formNode',
    metaInfo: [
      {
        fieldName: 'expression',
      },
      {
        fieldName: 'sourceProperty',
        required: true,
      },
      {
        fieldName: 'outputProperty',
        required: true,
      },
    ],
    presetValues: {
      expression: '',
      sortProperty: '',
      outputProperty: '',
    },
  },
  DeepReassignTask: {
    icon: 'fa-random',
  },
  SortTask: {
    icon: 'fa-sort',
    shapeType: 'Html',
    htmlPlugin: 'formNode',
    metaInfo: [
      {
        fieldName: 'mode',
        required: true,
        fieldType: 'select',
        options: [
          {
            value: 'ascending',
            label: 'Ascending',
          },
          {
            value: 'descending',
            label: 'Descending',
          },
        ],
      },
      {
        fieldName: 'sortProperty',
        required: true,
      },
      {
        fieldName: 'compareField',
        required: true,
      },
    ],
    presetValues: {
      mode: 'ascending',
      sortProperty: '',
      compareField: '',
    },
  },
  TransformTask: {
    icon: 'fa-random',
    shapeType: 'Html',
    htmlPlugin: 'formNode',
    metaInfo: [
      {
        fieldName: 'mode',
        required: true,
        fieldType: 'select',
        options: [
          {
            value: 'default',
            label: 'Default',
          },
          {
            value: 'indexedObjects',
            label: 'IndexedObjects',
          },
          {
            value: 'array',
            label: 'Array',
          },
        ],
      },
      {
        fieldName: 'transformProperty',
      },
      {
        fieldName: 'outputProperty',
      },
      {
        fieldName: 'clearPayload',
        fieldType: 'checkbox',
      },
    ],
    presetValues: {
      mode: 'default',
      transformProperty: '',
      mappings: [
        {
          sourceProperty: 'source',
          targetProperty: 'target',
        },
      ],
      outputProperty: '',
    },
  },
  GroupAndSumTask: {
    icon: 'fa-random',
    shapeType: 'Html',
    htmlPlugin: 'formNode',
    metaInfo: [
      {
        fieldName: 'groupProperty',
      },
      {
        fieldName: 'outputProperty',
      },
      {
        fieldName: 'clearPayload',
        fieldType: 'checkbox',
      },
    ],
    presetValues: {
      groupProperty: '',
      outputProperty: '',
      groupBy: [],
      sumProperties: [],
    },
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
    presetValues: {
      action: '',
      calculateNeighbours: true,
    },
    metaInfo: [
      {
        fieldName: 'action',
        required: true,
      },
      {
        fieldName: 'calculateNeighbours',
        fieldType: 'checkbox',
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
  MultiFormTask: {
    hasUI: true,
    shapeType: 'Html',
    htmlPlugin: 'formNode',
    uiComponent: 'MultiForm',
    metaInfo: [
      {
        fieldName: 'formFlows',
        fieldType: 'objectList',
        idProperty: 'formName',
        autoId: 'none',
        metaInfo: [
          {
            fieldName: 'formName',
            fieldType: 'text',
          },
          {
            fieldName: 'flowId',
            fieldType: 'select',
            datasource: '[PLAYGROUNDFLOW]',
          },
        ],
      },
    ],
  },
  SelectValueFromListTask: {
    shapeType: 'Html',
    htmlPlugin: 'formNode',
    metaInfo: [
      {
        fieldName: 'inputProperty',
        fieldType: 'text',
      },
      {
        fieldName: 'list',
        fieldType: 'objectList',
        viewMode: 'table',
        useValueToSelectFromPayloadProperty: 'inputProperty',
        useLocalFieldToSelect: 'selectionValue',
        metaInfo: [
          {
            fieldName: 'comparison',
            fieldType: 'select',
            options: [
              {
                value: 'smaller',
                label: 'Smaller',
                shortLabel: '<',
              },
              {
                value: 'smalleroreq',
                label: 'Smaller or Equal',
                shortLabel: '<=',
              },
              {
                value: 'eq',
                label: 'Equal',
                shortLabel: '==',
              },
              {
                value: 'greater',
                label: 'Greater',
                shortLabel: '>',
              },
              {
                value: 'greateroreq',
                label: 'Greater or Equal',
                shortLabel: '>=',
              },
            ],
          },
          {
            fieldName: 'selectionValue',
            label: 'compare value',
            fieldType: 'text',
            dataType: 'decimal',
          },
          {
            fieldName: 'outputValue',
            fieldType: 'text',
            dataType: 'decimal',
          },
        ],
      },
      {
        fieldName: 'selectvalue',
        fieldType: 'select',
        options: [
          {
            value: 'firstwins',
            label: 'First wins',
          },
          {
            value: 'lastwins',
            label: 'Last wins',
          },
        ],
      },
      {
        fieldName: 'outputProperty',
        fieldType: 'text',
      },
    ],
  },
  SvgTestTask: {
    hasUI: true,
    shapeType: 'Html',
    htmlPlugin: 'svgTestNode',
    hasMetaInfoInNode: false,
    hasConfigMenu: true,
    presetValues: {
      metaInfo: [],
    },
    configMenu: {
      fields: [],
    },
  },
  FormTask: {
    hasUI: true,
    shapeType: 'Html',
    htmlPlugin: 'formNode',
    hasMetaInfoInNode: true,
    hasConfigMenu: true,
    presetValues: {
      metaInfo: [],
    },
    configMenu: {
      fields: [
        {
          fieldName: 'metaInfo',
          fieldType: 'objectList',
          label: 'Form controls',
          idProperty: 'fieldId',
          autoId: 'none',
          metaInfo: [
            {
              fieldName: 'fieldName',
              fieldType: 'text',
              required: true,
            },
            {
              fieldName: 'fieldType',
              fieldType: 'select',
              required: true,
              options: [
                {
                  value: 'text',
                  label: 'Text Input',
                },
                {
                  value: 'radiobutton',
                  label: 'Radiobuttons',
                },
                {
                  value: 'checkbox',
                  label: 'Checkbox',
                },
                {
                  value: 'textarea',
                  label: 'Textarea',
                },
                {
                  value: 'richtexteditor',
                  label: 'Richtext Editor',
                },
                {
                  value: 'slider',
                  label: 'Slider',
                },
                {
                  value: 'select',
                  label: 'Select',
                },
                {
                  value: 'list',
                  label: 'List',
                },
              ],
            },
            {
              fieldName: 'label',
              fieldType: 'text',
            },
            {
              fieldName: 'required',
              fieldType: 'checkbox',
              label: 'Required field',
            },
            {
              fieldName: 'defaultValue',
            },
            {
              visibilityCondition: "(fieldType=='radiobutton') || (fieldType=='select')",
              fieldName: 'options',
              fieldType: 'objectList',
              label: 'Options',
              idProperty: 'radioButtonId',
              autoId: 'none',
              metaInfo: [
                {
                  fieldName: 'value',
                  fieldType: 'text',
                  required: true,
                },
                {
                  fieldName: 'label',
                  fieldType: 'text',
                },
              ],
            },
            ,
            {
              fieldName: 'visibilityCondition',
              fieldType: 'textarea',
            },
            ,
            {
              fieldName: 'min',
              fieldType: 'text',
              visibilityCondition: "(fieldType=='slider')",
            },
            ,
            {
              fieldName: 'max',
              fieldType: 'text',
              visibilityCondition: "(fieldType=='slider')",
            },
          ],
        },
      ],
    },
  },
  ScriptTask: {
    icon: 'fa-bug',
    shapeType: 'Html',
    htmlPlugin: 'formNode',
    supportsPresets: true,
    metaInfo: [
      {
        fieldName: 'outputProperty',
        fieldType: 'text',
      },
      {
        fieldName: 'script',
        fieldType: 'textarea',
      },
      {
        fieldName: 'parameters',
        fieldType: 'objectList',
        label: 'Function parameters',
        idProperty: 'parameterId',
        metaInfo: [
          {
            fieldName: 'parameterName',
            fieldType: 'text',
            required: true,
          },
          {
            fieldName: 'fieldType',
            required: true,
            fieldType: 'select',
            options: [
              {
                label: 'int32',
                value: 'int32',
              },
              {
                label: 'int64',
                value: 'int64',
              },
              {
                label: 'float32',
                value: 'float32',
              },
              {
                label: 'float64',
                value: 'float64',
              },
            ],
          },
        ],
      },
    ],
    presetValues: {
      outputProperty: 'script',
      script: '',
    },
  },
  PrototypeTask: {
    icon: 'fa-brain',
    shapeType: 'Html',
    htmlPlugin: 'formNode',
    metaInfo: [
      {
        fieldName: 'prototype',
        required: true,
        fieldType: 'select',
        options: [
          {
            value: 'default',
            label: 'Default',
          },
          {
            value: 'webassembly-test',
            label: 'Webassembly Test',
          },
        ],
      },
      {
        fieldName: 'outputProperty',
        fieldType: 'text',
      },
      {
        fieldName: 'input',
        fieldType: 'textarea',
      },
    ],
    presetValues: {
      prototype: 'default',
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
              value: 'list',
              label: 'list',
            },
            {
              value: 'color',
              label: 'color',
            },
            {
              value: 'animatedgridcanvas',
              label: 'animatedgridcanvas',
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
            {
              value: 'richtext',
              label: 'Richtext',
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
        { fieldName: 'template' },
        { fieldName: 'replaceValues', fieldType: 'checkbox' },
        { fieldName: 'asElement', fieldType: 'checkbox' },
        { fieldName: 'htmlElement' },
        { fieldName: 'cssClassName' },
        { fieldName: 'visibilityCondition' },
        {
          fieldName: 'flowId',
          visibilityCondition: 'visualizer == "animatedgridcanvas"',
          fieldType: 'select',
          datasource: '[PLAYGROUNDFLOW]',
        },
        {
          fieldName: 'script',
          fieldType: 'textarea',
          visibilityCondition: 'visualizer == "animatedgridcanvas"',
        },
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
  SendJsonTask: {
    shapeType: 'Rect',
    background: 'background-green',
    presetValues: {},
  },
  RouteEndpointTask: {
    background: 'background-blue',
    constraints: {
      input: {
        allowedInputs: 0,
        notAllowed: [],
        allowed: [],
      },
    },
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
  HtmlViewTask: {
    shapeType: 'Html',
    htmlPlugin: 'formNode',
    presetValues: {
      view: '',
      rows: 10,
      width: 600,
    },
    metaInfo: [
      {
        fieldName: 'view',
        fieldType: 'textarea',
        required: true,
      },
    ],
  },
  CustomNodeTask: {
    shapeType: 'Html',
    htmlPlugin: 'customNode',
  },
  ShapeNodeTask: {
    shapeType: 'Html',
    htmlPlugin: 'shapeNode',
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
