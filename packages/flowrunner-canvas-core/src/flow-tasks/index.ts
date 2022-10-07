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
import { TestTask } from '../flowrunner-plugins/test-task';

import { StateTask } from '../flowrunner-plugins/state-task';
import { StartStateTask } from '../flowrunner-plugins/start-state-task';
import { EventTask } from '../flowrunner-plugins/event-task';
import { StateMachineTask } from '../flowrunner-plugins/state-machine-task';
import { StateChangeTriggerTask } from '../flowrunner-plugins/state-change-trigger-task';
import { GuardTask } from '../flowrunner-plugins/guard-task';
import { GetCookie, SetCookie } from '../flowrunner-plugins/cookie-tasks';
import { OnStartFlowTask } from '../flowrunner-plugins/on-start-flow-task';
import { ImageTask } from '../flowrunner-plugins/image-task';
import { MapEventTask } from '../flowrunner-plugins/map-event-task';
import { FilterEventTask } from '../flowrunner-plugins/filter-event-task';
import { ReduceEventTask } from '../flowrunner-plugins/reduce-event-task';
import { OperationEventTask } from '../flowrunner-plugins/operation-event-task';
import { ApiProxyTask } from '../flowrunner-plugins/api-proxy-task';

export interface IFlowTask {
  new (): FlowTask;
}

export type FlowType = 'playground' | 'backend' | 'highlevel';
export interface ITask {
  FlowTask: IFlowTask;
  name: string;
  flowType: FlowType;
}

const customTasks: ITask[] = [];

export const registerCustomTask = (name: string, TaskClass: IFlowTask, flowType: FlowType) => {
  customTasks.push({
    FlowTask: TaskClass,
    name,
    flowType,
  });
};

const taskOverrides: { [taskName: string]: IFlowTask } = {};

export const registerTaskImplementationOverride = (name: string, TaskClass: IFlowTask) => {
  taskOverrides[name] = TaskClass;
};

function getTaskClass(name: string, TaskClass: IFlowTask): IFlowTask {
  return taskOverrides[name] || TaskClass;
}

export const registerTasks = (flow) => {
  console.log('registerTasks', customTasks);
  customTasks.forEach((task) => {
    if (task.flowType === 'playground') {
      flow.registerTask(task.name, task.FlowTask);
    }
  });

  flow.registerTask('Annotation', FlowTask);
  flow.registerTask('TestTask', TestTask);

  flow.registerTask('StateMachine', StateMachineTask);
  flow.registerTask('StartState', StartStateTask);
  flow.registerTask('State', StateTask);
  flow.registerTask('Event', EventTask);
  flow.registerTask('Guard', GuardTask);
  flow.registerTask('StateChangeTriggerTask', StateChangeTriggerTask);

  flow.registerTask('GetCookie', GetCookie);
  flow.registerTask('SetCookie', SetCookie);

  flow.registerTask('OnStartFlow', OnStartFlowTask);

  flow.registerTask('ImageTask', ImageTask);

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

  flow.registerTask('MapEventTask', MapEventTask);
  flow.registerTask('FilterEventTask', FilterEventTask);
  flow.registerTask('ReduceEventTask', ReduceEventTask);
  flow.registerTask('OperationEventTask', OperationEventTask);

  flow.registerTask('ApiProxyTask', getTaskClass('ApiProxyTask', ApiProxyTask));
};

export const getDefaultUITasks = () => {
  const tasks: any[] = [];

  customTasks.forEach((task) => {
    tasks.push({ className: task.name, fullName: task.name, flowType: task.flowType });
  });

  tasks.push({ className: 'TestTask', fullName: 'TestTask', flowType: 'playground' });

  tasks.push({ className: 'OnStartFlow', fullName: 'OnStartFlow', flowType: 'playground' });
  tasks.push({ className: 'StateMachine', fullName: 'StateMachine', flowType: 'playground' });
  tasks.push({ className: 'StartState', fullName: 'StartState', flowType: 'playground' });
  tasks.push({ className: 'State', fullName: 'State', flowType: 'playground' });
  tasks.push({ className: 'Event', fullName: 'Event', flowType: 'playground' });
  tasks.push({ className: 'Guard', fullName: 'Guard', flowType: 'playground' });
  tasks.push({ className: 'StateChangeTriggerTask', fullName: 'StateChangeTriggerTask', flowType: 'playground' });

  tasks.push({ className: 'SetCookie', fullName: 'SetCookie', flowType: 'playground' });
  tasks.push({ className: 'GetCookie', fullName: 'GetCookie', flowType: 'playground' });

  tasks.push({ className: 'AssignTask', fullName: 'AssignTask', flowType: 'playground' });
  tasks.push({ className: 'ClearTask', fullName: 'ClearTask', flowType: 'playground' });
  tasks.push({ className: 'ForwardTask', fullName: 'ForwardTask', flowType: 'playground' });
  tasks.push({ className: 'InjectIntoPayloadTask', fullName: 'InjectIntoPayloadTask', flowType: 'playground' });
  tasks.push({ className: 'ObserverTask', fullName: 'ObserverTask', flowType: 'playground' });
  tasks.push({ className: 'ObservableTask', fullName: 'ObservableTask', flowType: 'playground' });
  tasks.push({ className: 'TraceConsoleTask', fullName: 'TraceConsoleTask', flowType: 'playground' });
  tasks.push({ className: 'IfConditionTask', fullName: 'IfConditionTask', flowType: 'playground' });
  tasks.push({ className: 'WhileTask', fullName: 'WhileTask', flowType: 'playground' });
  tasks.push({ className: 'FunctionCallTask', fullName: 'FunctionCallTask', flowType: 'playground' });
  tasks.push({ className: 'FunctionInputTask', fullName: 'FunctionInputTask', flowType: 'playground' });
  tasks.push({ className: 'FunctionOutputTask', fullName: 'FunctionOutputTask', flowType: 'playground' });
  tasks.push({ className: 'ParallelTask', fullName: 'ParallelTask', flowType: 'playground' });
  tasks.push({ className: 'ParallelResolveTask', fullName: 'ParallelResolveTask', flowType: 'playground' });

  tasks.push({ className: 'DebugTask', fullName: 'DebugTask', flowType: 'playground' });
  tasks.push({ className: 'SliderTask', fullName: 'SliderTask', flowType: 'playground' });
  tasks.push({ className: 'RandomTask', fullName: 'RandomTask', flowType: 'playground' });
  tasks.push({ className: 'TimerTask', fullName: 'TimerTask', flowType: 'playground' });
  tasks.push({ className: 'ExpressionTask', fullName: 'ExpressionTask', flowType: 'playground' });
  tasks.push({ className: 'OutputValueTask', fullName: 'OutputValueTask', flowType: 'playground' });
  tasks.push({ className: 'ConditionalTriggerTask', fullName: 'ConditionalTriggerTask', flowType: 'playground' });
  tasks.push({ className: 'ApiProxyTask', fullName: 'ApiProxyTask', flowType: 'playground' });
  tasks.push({ className: 'MapPayloadTask', fullName: 'MapPayloadTask', flowType: 'playground' });
  tasks.push({ className: 'InputTask', fullName: 'InputTask', flowType: 'playground' });
  tasks.push({ className: 'ListTask', fullName: 'ListTask', flowType: 'playground' });
  tasks.push({ className: 'MatrixTask', fullName: 'MatrixTask', flowType: 'playground' });
  tasks.push({ className: 'GridEditTask', fullName: 'GridEditTask', flowType: 'playground' });
  tasks.push({ className: 'DataGridTask', fullName: 'DataGridTask', flowType: 'playground' });
  tasks.push({ className: 'SearchDataGridTask', fullName: 'SearchDataGridTask', flowType: 'playground' });
  tasks.push({ className: 'FilterDataGridTask', fullName: 'FilterDataGridTask', flowType: 'playground' });
  tasks.push({ className: 'TransformTask', fullName: 'TransformTask', flowType: 'playground' });
  tasks.push({ className: 'GroupAndSumTask', fullName: 'GroupAndSumTask', flowType: 'playground' });
  tasks.push({ className: 'SortTask', fullName: 'SortTask', flowType: 'playground' });
  tasks.push({ className: 'DeepAssignTask', fullName: 'DeepAssignTask', flowType: 'playground' });
  tasks.push({ className: 'ExtractUniqueTask', fullName: 'ExtractUniqueTask', flowType: 'playground' });
  tasks.push({ className: 'FilterTask', fullName: 'FilterTask', flowType: 'playground' });
  tasks.push({ className: 'CountTask', fullName: 'CountTask', flowType: 'playground' });
  tasks.push({ className: 'CustomCodeTask', fullName: 'CustomCodeTask', flowType: 'playground' });
  tasks.push({ className: 'SelectValueFromListTask', fullName: 'SelectValueFromListTask', flowType: 'playground' });
  tasks.push({ className: 'ImageTask', fullName: 'ImageTask', flowType: 'playground' });

  tasks.push({ className: 'RunWasmFlowTask', fullName: 'RunWasmFlowTask', flowType: 'playground' });
  tasks.push({ className: 'ScreenTask', fullName: 'ScreenTask', flowType: 'playground' });
  tasks.push({ className: 'FormTask', fullName: 'FormTask', flowType: 'playground' });
  tasks.push({ className: 'RunFlowTask', fullName: 'RunFlowTask', flowType: 'playground' });
  tasks.push({ className: 'PrototypeTask', fullName: 'PrototypeTask', flowType: 'playground' });
  tasks.push({ className: 'ScriptTask', fullName: 'ScriptTask', flowType: 'playground' });
  tasks.push({ className: 'CustomNodeTask', fullName: 'CustomNodeTask', flowType: 'playground' });
  tasks.push({ className: 'ShapeNodeTask', fullName: 'ShapeNodeTask', flowType: 'playground' });
  tasks.push({ className: 'MultiFormTask', fullName: 'MultiFormTask', flowType: 'playground' });

  tasks.push({ className: 'WeightedSumTask', fullName: 'WeightedSumTask', flowType: 'playground' });
  tasks.push({ className: 'ActivationTask', fullName: 'ActivationTask', flowType: 'playground' });
  tasks.push({ className: 'UpdateWeightsTask', fullName: 'UpdateWeightsTask', flowType: 'playground' });

  tasks.push({ className: 'SvgTestTask', fullName: 'SvgTestTask', flowType: 'playground' });
  tasks.push({ className: 'BundleFlowTask', fullName: 'BundleFlowTask', flowType: 'playground' });

  tasks.push({ className: 'MapEventTask', fullName: 'MapEventTask', flowType: 'playground' });
  tasks.push({ className: 'FilterEventTask', fullName: 'FilterEventTask', flowType: 'playground' });
  tasks.push({ className: 'ReduceEventTask', fullName: 'ReduceEventTask', flowType: 'playground' });
  tasks.push({ className: 'OperationEventTask', fullName: 'OperationEventTask', flowType: 'playground' });

  return tasks;
};
