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

export const registerTasks = (flow) => {
	flow.registerTask('SliderTask', SliderTask);
	flow.registerTask('ConditionalTriggerTask', ConditionalTriggerTask);
	flow.registerTask('MatrixTask', MatrixTask);
	flow.registerTask('GridEditTask', GridEditTask);
	flow.registerTask('DataGridTask', DataGridTask);
	flow.registerTask('RunWasmFlowTask', RunWasmFlowTask);
	flow.registerTask('ScreenTask', ScreenTask);
	flow.registerTask('FormTask', FormTask);
	flow.registerTask('RunFlowTask', RunFlowTask);
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
}