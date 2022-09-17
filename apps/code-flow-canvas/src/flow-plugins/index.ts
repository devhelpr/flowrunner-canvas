import { registerCustomNodeType } from '@devhelpr/flowrunner-canvas-core';
import { DummyTestTask } from './dummy-task';

export const registerCustomPlugins = () => {
  registerCustomNodeType(
    'DummyTestTask',
    {
      icon: 'fa-cube',
      shapeType: 'Html',
      htmlPlugin: 'formNode',
      showNotSelectedAsLabels: true,
      constraints: {
        input: {
          allowedInputs: 1,
          notAllowed: [],
          allowed: [],
        },
        output: {
          allowedOutputs: 1,
          notAllowed: [],
          allowed: [],
        },
      },
      metaInfo: [
        {
          fieldName: 'variableName',
          required: true,
        },
        {
          fieldName: 'expression',
          fieldType: 'textarea',
          required: true,
        },
      ],
    },
    'playground',
    DummyTestTask,
  );

  registerCustomNodeType(
    'LinkFlowTask',
    {
      icon: 'fa-cube',
      shapeType: 'Html',
      htmlPlugin: 'formNode',
      showNotSelectedAsLabels: true,

      metaInfo: [
        {
          fieldName: 'flowId',
          fieldType: 'select',
          required: true,
          datasource: '[PLAYGROUNDFLOW]',
        },
        {
          fieldName: 'linkToFlow',
          fieldType: 'linkbutton',
          linkTemplate: '/canvas/{flowId}',
          label: 'Open flow',
          enabledIfPropertyIsTruthy: 'flowId',
        },
      ],
    },
    'highlevel',
    DummyTestTask,
  );
};
