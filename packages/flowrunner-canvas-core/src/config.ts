import { FlowTask } from '@devhelpr/flowrunner';
import { FlowType, IFlowTask, registerCustomTask } from './flow-tasks';

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

export interface ICustomTaskConfig {
  shapeType?: string;
  subShapeType?: string;
  htmlPlugin?: 'formNode' | 'shapeNode' | string;
  shapeHint?: 'rect' | 'circle' | 'diamond' | 'triangle' | 'actor';
  label?: string | ((node: any) => string);
  icon?: string;
  iconIllustration?: string;
  background?: string;

  configMenu?: any;
  config?: any;
  hasClone?: boolean;
  hasThumbs?: boolean;
  hasConfigMenu?: boolean;
  hasUI?: boolean;
  isFormTask?: boolean;

  constraints?: any;
  events?: any[];

  metaInfo?: any[];
  presetValues?: any;
  hasMetaInfoInNode?: boolean;

  width?: number;
  height?: number;

  styleShapeBody?: any;
  style?: any;
  iconBgCssClasses?: string;
  iconBg?: string;
  strokeColor?: string;
  fillColor?: string;
  fillSelectedColor?: string;
  textColor?: string;

  htmlDataAttributes?: any;
  layout?: any;

  altThumbPositions?: number;
  cornerRadius?: number;
  isSkewed?: boolean;

  showNotSelectedAsLabels?: boolean;
  uiComponent?: string;
  supportsPresets?: boolean;

  isStartEnd?: boolean;
}

export interface ITaskTypeConfig {
  [taskName: string]: ICustomTaskConfig;
}

/*
_variable: {
    ...variableAttached,
  },
*/
const taskTypeConfig: ITaskTypeConfig = {
  AssignTask: {
    //_background: 'background-yellow',
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
  TestTask: {
    shapeType: 'Html',
    htmlPlugin: 'formNode',
    constraints: {
      output: {
        notAllowed: ['DebugTask'],
        allowed: [],
      },
      input: {
        notAllowed: ['AssignTask', 'DebugTask'],
        allowed: [],
      },
    },
    metaInfo: [],
    presetValues: {},
  },

  OnStartFlow: {
    shapeType: 'Html',
    shapeHint: 'circle',
    htmlPlugin: 'shapeNode',
    styleShapeBody: {
      width: '64px',
      height: '64px',
    },
    width: 64,
    height: 64,
    metaInfo: [],
    hasClone: false,
    hasThumbs: false,
    hasConfigMenu: false,
    iconIllustration: 'event',
    icon: 'fa-bolt',
    presetValues: {
      lineConnectionEndPoints: 'center-of-node',
      curveMode: 'straight',
      label: 'OnStartFlow',
    },
    configMenu: {
      fields: [],
    },
  },

  StateChangeTriggerTask: {
    shapeType: 'Html',
    shapeHint: 'circle',
    htmlPlugin: 'shapeNode',
    styleShapeBody: {
      width: '64px',
      height: '64px',
    },
    width: 64,
    height: 64,
    hasClone: false,
    hasThumbs: false,
    iconIllustration: 'event',
    icon: 'fa-bolt',
    constraints: {
      input: {
        allowedInputs: 0,
      },
    },
    metaInfo: [],
    configMenu: {
      fields: [
        {
          fieldName: 'State',
        },
        {
          fieldName: 'label',
        },
      ],
    },
    presetValues: {
      resetOutputPath: true,
      resetOutputPathOnError: true,
      lineConnectionEndPoints: 'center-of-node',
      curveMode: 'straight',
    },
    hasConfigMenu: true,
  },

  StateMachine: {
    shapeType: 'Html',
    htmlPlugin: 'formNode',
    metaInfo: [
      {
        fieldName: 'StateMachine',
      },
      {
        fieldName: 'SetInitialState',
        label: 'Set inital state',
        fieldType: 'checkbox',
      },
      {
        fieldName: 'Event',
        visibilityCondition: 'SetInitialState == false',
      },
      {
        fieldName: 'State',
        visibilityCondition: 'SetInitialState == 1',
      },
      {
        fieldName: 'Expression',
      },
    ],
    presetValues: {},
  },

  StartState: {
    shapeType: 'Html',
    shapeHint: 'circle',
    htmlPlugin: 'shapeNode',
    constraints: {
      output: {
        notAllowed: [],
        allowed: ['State'],
        allowedOutputs: 1,
      },
      input: {
        allowedInputs: 0,
      },
    },
    styleShapeBody: {
      width: '64px',
      height: '64px',
    },
    width: 64,
    height: 64,
    metaInfo: [],
    hasClone: false,
    hasThumbs: false,
    hasConfigMenu: true,
    htmlDataAttributes: [
      {
        attributeName: 'startState',
        value: '{stateMachine}',
      },
    ],
    presetValues: {
      lineConnectionEndPoints: 'center-of-node',
      curveMode: 'straight',
    },
    configMenu: {
      fields: [
        {
          fieldName: 'stateMachine',
        },
        {
          fieldName: 'label',
        },
      ],
    },
  },

  State: {
    shapeType: 'Html',
    htmlPlugin: 'shapeNode',
    constraints: {
      input: {
        allowed: ['Event', 'StartState', 'Guard'],
      },
      output: {
        notAllowed: [],
        allowed: ['Event'],
      },
    },
    styleShapeBody: {
      width: '200px',
      height: '64px',
    },
    label: '{StateName}',
    width: 200,
    height: 64,
    metaInfo: [],
    hasConfigMenu: true,
    hasClone: false,
    hasThumbs: false,
    configMenu: {
      fields: [
        {
          fieldName: 'StateName',
        },
      ],
    },
    htmlDataAttributes: [
      {
        attributeName: 'state',
        value: '{StateName}',
      },
    ],
    presetValues: {
      lineConnectionEndPoints: 'center-of-node',
      curveMode: 'arc',
    },
  },
  Event: {
    shapeType: 'Html',
    htmlPlugin: 'shapeNode',
    constraints: {
      input: {
        allowed: ['State'],
        allowedInputs: 1,
      },
      output: {
        notAllowed: [],
        allowed: ['State', 'Guard'],
        allowedOutputs: 1,
      },
    },
    styleShapeBody: {
      width: '200px',
      height: '64px',
    },
    width: 200,
    height: 64,
    label: '{EventName}',
    metaInfo: [],
    hasConfigMenu: true,
    hasClone: false,
    hasThumbs: false,
    htmlDataAttributes: [
      {
        attributeName: 'event',
        value: '{EventName}',
      },
    ],
    configMenu: {
      fields: [
        {
          fieldName: 'EventName',
        },
      ],
    },
    presetValues: {
      lineConnectionEndPoints: 'center-of-node',
      curveMode: 'arc',
    },
  },

  Guard: {
    shapeType: 'Html',
    htmlPlugin: 'shapeNode',
    constraints: {
      input: {
        allowed: ['Event'],
        allowedInputs: 1,
      },
      output: {
        notAllowed: [],
        allowed: ['State'],
        allowedOutputs: 1,
      },
    },
    styleShapeBody: {
      width: '200px',
      height: '64px',
    },
    width: 200,
    height: 64,
    label: '{GuardName}',
    metaInfo: [],
    hasConfigMenu: true,
    hasClone: false,
    hasThumbs: false,
    htmlDataAttributes: [
      {
        attributeName: 'guard',
        value: '{GuardName}',
      },
    ],
    configMenu: {
      fields: [
        {
          fieldName: 'GuardName',
        },
        {
          fieldName: 'Expression',
        },
      ],
    },
    presetValues: {
      lineConnectionEndPoints: 'center-of-node',
      curveMode: 'arc',
    },
  },

  GetCookie: {
    shapeType: 'Html',
    htmlPlugin: 'formNode',
    metaInfo: [
      {
        fieldName: 'cookieName',
        required: true,
      },
      {
        fieldName: 'defaultValue',
      },
      {
        fieldName: 'defaultValueFromProperty',
      },
    ],
    presetValues: {
      cookieName: '',
      defaultValue: '',
      defaultValueFromProperty: '',
    },
  },
  SetCookie: {
    shapeType: 'Html',
    htmlPlugin: 'formNode',
    metaInfo: [
      {
        fieldName: 'cookieName',
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
      cookieName: '',
      value: '',
      valueFromProperty: '',
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
      mode: 'expression',
      dontTriggerOnEmptyValues: true,
    },
    //_label: '{compareProperty} {usingCondition} {withProperty}{withValue}',
    //label:
    //  '{expression} {compareProperty} {usingCondition=>"equals":"==","not-equals":"<>","smaller":"<","smaller-or-equal":"<=","bigger-or-equal":">=","bigger":">","default":""} "{withProperty|withValue}"',
    label: (node: any) => {
      if (node && node.mode === 'expression') {
        return '{expression}';
      }
      return '{compareProperty} {usingCondition=>"equals":"==","not-equals":"<>","smaller":"<","smaller-or-equal":"<=","bigger-or-equal":">=","bigger":">","default":""} "{withProperty|withValue}"';
    },
    hasConfigMenu: true,
    configMenu: {
      fields: [
        { fieldName: 'expression', fieldType: 'textarea', required: true, visibilityCondition: 'mode == "expression"' },
        { fieldName: 'compareProperty', required: true, visibilityCondition: 'mode != "expression"' },
        { fieldName: 'withProperty', visibilityCondition: 'mode != "expression"' },
        { fieldName: 'withValue', visibilityCondition: 'mode != "expression"' },
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
          visibilityCondition: 'mode != "expression"',
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
          visibilityCondition: 'mode != "expression"',
        },
        {
          fieldName: 'mode',
          fieldType: 'select',
          options: [
            {
              label: 'Default',
              value: 'default',
            },
            {
              label: 'Expression',
              value: 'expression',
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
    //_label: '{compareProperty} {usingCondition} {withProperty}{withValue}',
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
    //_label: '{compareProperty} {usingCondition} {withProperty}{withValue}',
    label:
      'value {condition=>"eq":"=","not-equals":"<>","lower":"<","lowereq":"<=","bigger-or-equal":">=","bigger":">","default":""} {valueInt}',
  },
  InjectIntoPayloadTask: {
    icon: 'fa-cubes',
    //_shapeType: 'Html',
    //_htmlPlugin: 'shapeNode',
    layout: {
      strokeColor: '#d61bd8',
      fillColor: '#d550d7',
      fillSelectedColor: '#d32cd5',
      textColor: '#ffffff',
    },
    presetValues: {
      object: {},
    },
    /*
    _styleNode: {
      '--thumb-color': 'purple',
    },
    _style: {
      borderRadius: '40px',
      border: '2px solid purple',
    },
    _styleShapeBody: {
      _width: '200px',
      _height: '200px',
    },
    _width: 200,
    _height: 200,
    */
    config: {
      objects: [
        {
          id: '202809c7-964a-43a1-a590-57a93346d875',
          imageUrl: '/media/earth.jpg',
          css: 'tw-h-full tw-w-full tw-object-cover',
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
    shapeType: 'Html',
    htmlPlugin: 'formNode',
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
    //_isStartEnd: true,
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
      httpMethod: 'get',
      sendPayloadToApi: false,
    },
    hasConfigMenu: true,
    configMenu: {
      fields: [
        { fieldName: 'url', required: true },
        { fieldName: 'urlIsPropertyName', fieldType: 'checkbox' },
        {
          fieldName: 'httpMethod',
          fieldtype: 'select',
          defaultValue: 'get',
          options: [
            {
              value: 'get',
              label: 'get',
            },
            {
              value: 'post',
              label: 'post',
            },
            {
              value: 'delete',
              label: 'delete',
            },
            {
              value: 'put',
              label: 'put',
            },
            {
              value: 'patch',
              label: 'patch',
            },
          ],
        },
        { fieldName: 'sendPayloadToApi', fieldType: 'checkbox' },
      ],
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
  CreateListTask: {
    shapeType: 'Html',
    icon: 'fa-bars',
    presetValues: {
      listExpression: '',
      assignToProperty: '',
      forceNumeric: true,
    },
    htmlPlugin: 'formNode',
    showNotSelectedAsLabels: true,
    metaInfo: [
      {
        fieldName: 'listExpression',
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
      {
        fieldName: 'forceNumeric',
        fieldType: 'checkbox',
      },
      {
        fieldName: 'noLocalState',
        fieldType: 'checkbox',
      },
    ],
  },
  Variable: {
    shapeType: 'Html',
    icon: 'fas fa-store',
    constraints: {
      input: {
        allowed: [],
        allowedInputs: 0,
      },
      output: {
        notAllowed: [],
        allowed: [],
        allowedOutputs: 0,
      },
    },
    presetValues: {
      variableName: '',
    },
    htmlPlugin: 'formNode',
    metaInfo: [
      {
        fieldName: 'variableName',
        required: true,
      },
      {
        fieldName: 'initialValue',
      },
    ],
  },
  VariableChangeTriggerTask: {
    shapeType: 'Html',
    presetValues: {
      variableName: '',
    },
    icon: 'fa-bolt',
    constraints: {
      input: {
        allowedInputs: 0,
      },
    },
    htmlPlugin: 'formNode',
    metaInfo: [
      {
        fieldName: 'variableName',
        required: true,
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
      {
        fieldName: 'linkToFlow',
        fieldType: 'linkbutton',
        linkTemplate: '/canvas/{flowId}',
        label: 'Open flow',
        enabledIfPropertyIsTruthy: 'flowId',
      },
    ],
    presetValues: {},
  },
  BundleFlowTask: {
    hasUI: false,
    hasClone: false,
    shapeType: 'Html',
    htmlPlugin: 'shapeNode',
    hasConfigMenu: true,
    configMenu: {
      fields: [
        {
          fieldName: 'label',
          label: 'Label',
        },
        {
          fieldName: 'hint',
          label: 'Hint',
          fieldType: 'textarea',
        },
        {
          fieldName: 'iconBg',
          label: 'Icon',
        },
      ],
    },
    layout: {
      strokeColor: '#d61bd8',
      fillColor: '#d550d7',
      fillSelectedColor: '#d32cd5',
      textColor: '#ffffff',
    },
    style: {
      borderRadius: '40px',
      border: '4px solid black',
    },
    styleShapeBody: {
      width: '200px',
      height: '200px',
    },
    width: 200,
    height: 200,
    iconBgCssClasses: 'tw-text-7xl tw-opacity-20',
    iconBg: 'fas fa-project-diagram',
    metaInfo: [],
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
  DataTableTask: {
    hasUI: true,
    hasConfigMenu: true,
    shapeType: 'Html',
    htmlPlugin: 'dataTableNode',
    icon: 'fa-table',
    presetValues: {
      htmlPlugin: 'dataTableNode',
      propertyName: '',
      events: [
        {
          eventName: 'onDelete',
        },
        {
          eventName: 'onUpdate',
        },
        {
          eventName: 'onCreate',
        },
      ],
    },
    configMenu: {
      fields: [
        { fieldName: 'dataPropertyName' },
        {
          fieldName: 'columns',
          fieldType: 'objectList',
          label: 'Columns',
          idProperty: 'fieldId',
          autoId: 'none',
          metaInfo: [
            {
              fieldName: 'columnName',
              fieldType: 'text',
              required: true,
            },
          ],
        },
        { fieldName: 'hasDelete', fieldType: 'checkbox' },
        { fieldName: 'hasUpdate', fieldType: 'checkbox' },
        { fieldName: 'hasCreate', fieldType: 'checkbox' },
        { fieldName: 'idProperty' },
      ],
    },
    events: [
      {
        eventName: 'onDelete',
      },
      {
        eventName: 'onUpdate',
      },
      {
        eventName: 'onCreate',
      },
    ],
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
    shapeType: 'Html',
    htmlPlugin: 'timerNode',
    events: [
      {
        eventName: 'onTimer',
      },
    ],
    presetValues: {
      events: [
        {
          eventName: 'onTimer',
        },
      ],
    },
    hasConfigMenu: true,
    configMenu: {
      fields: [
        {
          fieldName: 'interval',
          fieldType: 'slider',
          required: true,
          label: 'Interval(ms)',
          dataType: 'number',
          min: 50,
          max: 5000,
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
          visibilityCondition: 'mode=="executeNode"',
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
  MapEventTask: {
    shapeType: 'Html',
    htmlPlugin: 'formNode',
    iconIllustration: 'map',
    events: [
      {
        eventName: 'onElement',
      },
    ],
    metaInfo: [
      {
        fieldName: 'listProperty',
      },
      {
        fieldName: 'outputProperty',
      },
    ],
  },
  OperationEventTask: {
    shapeType: 'Html',
    htmlPlugin: 'formNode',
    events: [
      {
        eventName: 'onElement',
      },
    ],
    metaInfo: [
      {
        fieldName: 'operation',
        fieldType: 'select',
        options: [
          { label: 'Fill list', value: 'fillList' },
          { label: 'Call operator', value: 'callOperator' },
        ],
      },
      {
        fieldName: 'ExecuteCount',
        label: 'Execure count',
      },

      {
        fieldName: 'outputProperty',
      },
    ],
    presetValues: {
      events: [
        {
          eventName: 'onElement',
        },
      ],
    },
  },
  FilterEventTask: {
    shapeType: 'Html',
    htmlPlugin: 'formNode',
    iconIllustration: 'filter',
    events: [
      {
        eventName: 'onElement',
      },
    ],
    metaInfo: [
      {
        fieldName: 'listProperty',
      },
      {
        fieldName: 'outputProperty',
      },
    ],
    presetValues: {
      events: [
        {
          eventName: 'onElement',
        },
      ],
    },
  },
  ReduceEventTask: {
    shapeType: 'Html',
    htmlPlugin: 'formNode',
    iconIllustration: 'reduce',
    events: [
      {
        eventName: 'onElement',
      },
    ],
    metaInfo: [
      {
        fieldName: 'listProperty',
      },
      {
        fieldName: 'outputProperty',
      },
      {
        fieldName: 'startValue',
      },
    ],
    presetValues: {
      events: [
        {
          eventName: 'onElement',
        },
      ],
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
          fieldName: 'formTitle',
          fieldType: 'text',
          label: 'Form Title',
        },
        {
          fieldName: 'formStepTitle',
          fieldType: 'text',
          label: 'Form Step Title',
        },
        {
          fieldName: 'formStepCategory',
          fieldType: 'text',
          label: 'Form Step Category',
        },
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
                {
                  value: 'image',
                  label: 'Image',
                },
                {
                  value: 'video',
                  label: 'Video',
                },
                {
                  value: 'stateMachineEventButton',
                  label: 'StateMachine Event Button',
                },
                {
                  value: 'triggerbutton',
                  label: 'Trigger Button',
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
            {
              visibilityCondition: "(fieldType=='radiobutton') || (fieldType=='select')",
              fieldName: 'datasource',
              fieldType: 'text',
              label: 'Datasource',
              idProperty: 'datasourceId',
              autoId: 'none',
            },
            {
              visibilityCondition: "(fieldType=='radiobutton') || (fieldType=='select')",
              fieldName: 'datasourceLabelProperty',
              fieldType: 'text',
              label: 'Datasource label property',
            },
            {
              visibilityCondition: "(fieldType=='radiobutton') || (fieldType=='select')",
              fieldName: 'datasourceValueProperty',
              fieldType: 'text',
              label: 'Datasource value property',
            },
            {
              visibilityCondition: "fieldType=='image'",
              fieldName: 'aspectRatio',
              fieldType: 'select',
              defaultValue: '',
              options: [
                {
                  value: '',
                  label: 'Default',
                },
                {
                  value: 'tw-aspect-square',
                  label: 'Square',
                },
                {
                  value: 'tw-aspect-video',
                  label: '16/9',
                },
              ],
            },
            {
              fieldName: 'visibilityCondition',
              fieldType: 'textarea',
            },
            {
              fieldName: 'min',
              fieldType: 'text',
              visibilityCondition: "(fieldType=='slider')",
            },
            {
              fieldName: 'max',
              fieldType: 'text',
              visibilityCondition: "(fieldType=='slider')",
            },
            {
              fieldName: 'autoTrigger',
              fieldType: 'checkbox',
              label: 'AutoTrigger',
              defaultValue: true,
              visibilityCondition: "(fieldType=='triggerbutton')",
            },
          ],
        },
        {
          fieldName: 'formDefinitionAsPayload',
          fieldType: 'checkbox',
          label: 'Send form definition via payload',
        },
        {
          fieldName: 'renderFormViaMetaInfoInPayload',
          fieldType: 'checkbox',
          label: 'Render form based on payload',
        },
        {
          fieldName: 'outputExpression',
          fieldType: 'text',
          label: 'Output expression',
        },
        {
          fieldName: 'outputProperty',
          fieldType: 'text',
          label: 'Output property',
        },
        {
          fieldName: 'cssClassName',
          fieldType: 'text',
          label: 'CSS ClassName',
        },
        {
          fieldName: 'formMode',
          fieldType: 'select',
          defaultValue: 'default',
          options: [
            {
              label: 'Default',
              value: 'default',
            },
            {
              label: 'CRUD',
              value: 'crud',
            },
          ],
        },
        {
          fieldName: 'idProperty',
          visibilityCondition: 'formMode == "crud"',
          required: true,
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
    constraints: {
      input: {
        notAllowed: [],
        allowed: [],
      },
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
              value: 'statictext',
              label: 'Static Text',
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
        { fieldName: 'text', visibilityCondition: 'visualizer == "statictext"' },

        { fieldName: 'xProperty', visibilityCondition: 'visualizer == "xycanvas"' },
        { fieldName: 'yProperty', visibilityCondition: 'visualizer == "xycanvas"' },
        { fieldName: 'listProperty', visibilityCondition: 'visualizer == "xycanvas"' },
        { fieldName: 'color', visibilityCondition: 'visualizer == "xycanvas" || visualizer == "color"' },
        { fieldName: 'includeLines', fieldType: 'checkbox', visibilityCondition: 'visualizer == "xycanvas"' },
        { fieldName: 'showCurved', fieldType: 'checkbox', visibilityCondition: 'visualizer == "xycanvas"' },
        {
          fieldName: 'propertyName',
          visibilityCondition: 'visualizer == "text" || visualizer == "richtext" || visualizer == "number"',
        },

        { fieldName: 'format', visibilityCondition: 'visualizer == "number"' },
        { fieldName: 'fixed', dataType: 'number', visibilityCondition: 'visualizer == "number"' },
        { fieldName: 'decimalSeparator', visibilityCondition: 'visualizer == "number"' },
        {
          fieldName: 'afterLabel',
          visibilityCondition: 'visualizer == "text" || visualizer == "richtext" || visualizer == "number"',
        },
        {
          fieldName: 'rows',
          dataType: 'number',
          visibilityCondition: 'visualizer == "gridcanvas" || visualizer == "animiatedgridcanvas"',
        },
        {
          fieldName: 'columns',
          dataType: 'number',
          visibilityCondition: 'visualizer == "gridcanvas" || visualizer == "animiatedgridcanvas"',
        },
        {
          fieldName: 'mode',
          defaultValue: 'matrix',
          visibilityCondition: 'visualizer == "gridcanvas" || visualizer == "animiatedgridcanvas"',
        },

        { fieldName: 'template', visibilityCondition: 'visualizer == "text" || visualizer == "richtext"' },
        {
          fieldName: 'replaceValues',
          fieldType: 'checkbox',
          visibilityCondition: 'visualizer == "text" || visualizer == "richtext"',
        },
        {
          fieldName: 'asElement',
          fieldType: 'checkbox',
          visibilityCondition: 'visualizer == "text"',
        },
        { fieldName: 'htmlElement', visibilityCondition: 'visualizer == "text" || visualizer == "richtext"' },
        { fieldName: 'cssClassName', visibilityCondition: 'visualizer == "text" || visualizer == "statictext"' },
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
        {
          fieldName: 'formTitle',
          fieldType: 'text',
          label: 'Form Title',
        },
        {
          fieldName: 'formStepTitle',
          fieldType: 'text',
          label: 'Form Step Title',
        },

        {
          fieldName: 'elements',
          fieldType: 'objectList',
          label: 'Elements',
          idProperty: 'fieldId',
          autoId: 'none',
          metaInfo: [
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
                  value: 'statictext',
                  label: 'Static Text',
                },
              ],
            },
            { fieldName: 'text', visibilityCondition: 'visualizer == "statictext"' },
            { fieldName: 'propertyName' },
            { fieldName: 'format' },
            { fieldName: 'fixed', dataType: 'number' },
            { fieldName: 'decimalSeparator' },
            { fieldName: 'afterLabel' },
            { fieldName: 'template' },
            { fieldName: 'replaceValues', fieldType: 'checkbox' },
            { fieldName: 'asElement', fieldType: 'checkbox' },
            { fieldName: 'htmlElement' },
            { fieldName: 'cssClassName' },
            { fieldName: 'visibilityCondition' },
          ],
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
  ImageTask: {
    shapeType: 'Html',
    htmlPlugin: 'customNode',
    config: {
      objects: [
        {
          id: '202809c7-964a-43a1-a590-57a93346d875',
          css: 'tw-object-cover tw-h-[250px] tw-w-[250px]',
          imageCss: 'tw-h-full tw-w-full',
        },
      ],
    },
  },
};

let fullConfig = { ...taskTypeConfig };

export const setCustomConfig = (className: string, config: ICustomTaskConfig) => {
  if (config) {
    customConfig[className] = config;
  }
  fullConfig = getTaskConfig();
};

export const registerCustomNodeType = (className: string, config: any, flowType: FlowType, taskClass: IFlowTask) => {
  registerCustomTask(className, taskClass, flowType);
  if (config) {
    customConfig[className] = config;
  }
  fullConfig = getTaskConfig();
};

export const getTaskConfig = () => {
  return { ...taskTypeConfig, ...customConfig };
};

export const getTaskConfigForTask = (className) => {
  return fullConfig[className] || {};
};
