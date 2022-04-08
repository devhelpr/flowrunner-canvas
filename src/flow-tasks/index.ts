import { FlowTask } from '@devhelpr/flowrunner';
import { ConditionalTriggerTask } from '../flowrunner-plugins/conditional-trigger-task';
import { MatrixTask } from '../flowrunner-plugins/matrix-task';
import { SliderTask } from '../flowrunner-plugins/slider-task';
import { GridEditTask } from '../flowrunner-plugins/grid-edit-task';
import { RunWasmFlowTask } from '../flowrunner-plugins/run-wasm-flow-task';
import { DataGridTask } from '../flowrunner-plugins/data-grid-task';

import { ScreenTask } from '../flowrunner-plugins/screen-task';
import { FormTask } from '../flowrunner-plugins/form-task';
import { RunFlowTask } from '../flowrunner-plugins/run-flow-task';

import { WeightedSumTask, ActivationTask, UpdateWeightsTask } from '../flowrunner-plugins/perceptron';
import { SearchDataGridTask } from '../flowrunner-plugins/search-datagrid-task';
import { FilterDataGridTask } from '../flowrunner-plugins/filter-datagrid-task';

import { TransformTask } from '../flowrunner-plugins/transform-task';
import { SortTask } from '../flowrunner-plugins/sort-task';
import { DeepAssignTask } from '../flowrunner-plugins/deep-assign-task';
import { ExtractUniqueTask } from '../flowrunner-plugins/extract-unique-task';
import { FilterTask } from '../flowrunner-plugins/filter-task';
import { CountTask } from '../flowrunner-plugins/count-task';
import { CustomCodeTask } from '../flowrunner-plugins/custom-code-task';
import { DebugTask } from '../flowrunner-plugins/debug-task';
import { GroupAndSumTask } from '../flowrunner-plugins/group-and-sum-task';

import { ExpressionTask } from '../flowrunner-plugins/expression-task';
import { MultiFormTask } from '../flowrunner-plugins/multi-form-task';
import { SelectValueFromListTask } from '../flowrunner-plugins/select-value-from-list-task';

import { PrototypeTask } from '../flowrunner-plugins/prototype-task';
import { ScriptTask } from '../flowrunner-plugins/script-task';
import { WhileTask } from '../flowrunner-plugins/while-task';
import { SvgTestTask } from '../flowrunner-plugins/svg-test-task';
import { CustomNodeTask } from '../flowrunner-plugins/custom-node-task';
import { ShapeNodeTask } from '../flowrunner-plugins/shape-node-task';
import { BundleFlowTask } from '../flowrunner-plugins/bundle-flow-task';

export const registerTasks = flow => {
  flow.registerTask('Annotation', FlowTask);
  flow.registerTask('SliderTask', SliderTask);
  flow.registerTask('ConditionalTriggerTask', ConditionalTriggerTask);
  flow.registerTask('WhileTask', WhileTask);
  flow.registerTask('MatrixTask', MatrixTask);
  flow.registerTask('GridEditTask', GridEditTask);
  flow.registerTask('DataGridTask', DataGridTask);
  flow.registerTask('RunWasmFlowTask', RunWasmFlowTask);
  flow.registerTask('ScreenTask', ScreenTask);
  flow.registerTask('FormTask', FormTask);
  flow.registerTask('RunFlowTask', RunFlowTask);
  flow.registerTask('BundleFlowTask', BundleFlowTask);
  flow.registerTask('SearchDataGridTask', SearchDataGridTask);
  flow.registerTask('FilterDataGridTask', FilterDataGridTask);
  flow.registerTask('WeightedSumTask', WeightedSumTask);
  flow.registerTask('ActivationTask', ActivationTask);
  flow.registerTask('UpdateWeightsTask', UpdateWeightsTask);
  flow.registerTask('TransformTask', TransformTask);
  flow.registerTask('SortTask', SortTask);
  flow.registerTask('DeepAssignTask', DeepAssignTask);
  flow.registerTask('ExtractUniqueTask', ExtractUniqueTask);
  flow.registerTask('FilterTask', FilterTask);
  flow.registerTask('CountTask', CountTask);
  flow.registerTask('CustomCodeTask', CustomCodeTask);
  flow.registerTask('DebugTask', DebugTask);
  flow.registerTask('GroupAndSumTask', GroupAndSumTask);
  flow.registerTask('ExpressionTask', ExpressionTask);
  flow.registerTask('MultiFormTask', MultiFormTask);
  flow.registerTask('SelectValueFromListTask', SelectValueFromListTask);
  flow.registerTask('PrototypeTask', PrototypeTask);
  flow.registerTask('ScriptTask', ScriptTask);
  flow.registerTask('SvgTestTask', SvgTestTask);
  flow.registerTask('customNodeTask', CustomNodeTask);
  flow.registerTask('shapeNodeTask', ShapeNodeTask);
};
