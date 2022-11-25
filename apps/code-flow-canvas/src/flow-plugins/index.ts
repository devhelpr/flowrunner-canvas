import { registerCustomNodeType } from '@devhelpr/flowrunner-canvas-core';
import { DummyTestTask } from './dummy-task';
import { WebassemblyPackageTask } from './wasm-package-task';

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
        {
          fieldName: 'testjson',
          fieldType: 'textarea',
          storeAsBase64: true,
        },
        {
          fieldName: 'wasm',
          fieldType: 'fileupload',
          storeAsBase64: true,
          acceptFiles: '.wasm',
        },
        {
          fieldName: 'noParams',
          fieldType: 'checkbox',
        },
      ],
    },
    'playground',
    DummyTestTask,
  );

  registerCustomNodeType(
    'WebassemblyPackageTask',
    {
      icon: 'fa-cube',
      shapeType: 'Html',
      htmlPlugin: 'formNode',
      showNotSelectedAsLabels: true,
      constraints: {
        input: {
          notAllowed: [],
          allowed: [],
        },
        output: {
          notAllowed: [],
          allowed: [],
        },
      },
      metaInfo: [
        {
          fieldName: 'wasmPackage',
          label: 'Upload wasm package',
          fieldType: 'fileupload',
          storeAsBase64: true,
          acceptFiles: '.wasm.json',
        },
      ],
    },
    'playground',
    WebassemblyPackageTask,
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
