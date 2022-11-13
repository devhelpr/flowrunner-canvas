import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Draggable } from './draggable';
//import fetch from 'cross-fetch';
import {
  FlowToCanvas,
  getDefaultUITasks,
  IFlowrunnerConnector,
  useCanvasModeStateStore,
  useModulesStateStore,
} from '@devhelpr/flowrunner-canvas-core';
import { DragginTask } from '../../dragging-task';

export interface TaskbarProps {
  flowrunnerConnector: IFlowrunnerConnector;
  isDragging: boolean;
  hasCustomNodesAndRepository: boolean;
  hasDefaultUITasks: boolean;
}

export enum TaskMenuMode {
  tasks = 0,
  modules,
}

export interface IModule {
  id: string;
  name: string;
  fileName: string;
  moduleType: string;
  urlProperty: string;
  structure: string;
  primaryKey: string;
}

export const Taskbar = (props: TaskbarProps) => {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [metaDataInfo, setMetaDataInfo] = useState([] as any[]);
  const [menuMode, setMenuMode] = useState(TaskMenuMode.tasks);
  const [modules, setModules] = useState([] as IModule[]);
  const [repositoryItems, setRepositoryItems] = useState({} as any);
  const [customNodes, setCustomNodes] = useState({} as any);

  const canvasMode = useCanvasModeStateStore();
  const modulesMenu = useModulesStateStore();

  const abortableControllerRef = useRef<any>(null);

  const setupTasks = (metaDataInfo: any[]) => {
    const taskPluginsSortedList = metaDataInfo.sort((a, b) => {
      if (a.fullName < b.fullName) {
        return -1;
      }
      if (a.fullName > b.fullName) {
        return 1;
      }
      return 0;
    });
    const tasks = taskPluginsSortedList
      .filter((task) => {
        return task.flowType == canvasMode.flowType || task.flowType == '*';
      })
      .map((task) => {
        const taskSettings = FlowToCanvas.getTaskSettings(task.className);
        return { ...task, icon: taskSettings.icon || task.icon || '' };
      });

    setMetaDataInfo(tasks);
  };

  const loadTasks = () => {
    console.log('loadTasks', metaDataInfo);
    const { signal } = abortableControllerRef.current;
    if (props.flowrunnerConnector.hasStorageProvider) {
      console.log('loadTasks - hasStorageProvider');
      let tasks: any[] = props.flowrunnerConnector.storageProvider?.getTasks() || [];
      setupTasks([...tasks, ...props.flowrunnerConnector.getTasksFromPluginRegistry()]);
      setHasLoaded(true);

      return;
    }

    fetch('/api/tasks', { signal })
      .then((res) => {
        if (res.status >= 400) {
          throw new Error('Bad response from server');
        }
        return res.json();
      })
      .then((metaDataInfo) => {
        console.log('loadTasks - after fetch', metaDataInfo);

        let defaultTasks: any[] = [];
        if (!!props.hasDefaultUITasks) {
          defaultTasks = getDefaultUITasks();
        }
        setupTasks([
          ...metaDataInfo,
          ...defaultTasks,
          ...props.flowrunnerConnector.getTasksFromPluginRegistry(),
          {
            fullName: 'Text annotation',
            className: 'AnnotationText',
            taskType: 'Annotation',
            shapeType: 'Text',
            flowType: '*',
            title: 'Text annotation',
            isAnnotation: true,
          },
          {
            fullName: 'Actor',
            className: 'AnnotationActor',
            taskType: 'Annotation',
            shapeType: 'Actor',
            shapeHint: 'Actor',
            flowType: '*',
            title: 'Actor',
            isAnnotation: true,
          },
        ]);

        setHasLoaded(true);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const loadModules = () => {
    const { signal } = abortableControllerRef.current;
    fetch('/api/modules', { signal })
      .then((res) => {
        if (res.status >= 400) {
          throw new Error('Bad response from server');
        }
        return res.json();
      })
      .then((modules) => {
        console.log('modules', modules);
        setModules(modules);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const loadRepositoryItems = () => {
    const { signal } = abortableControllerRef.current;
    fetch('/api/module?codeName=repository', { signal })
      .then((res) => {
        if (res.status >= 400) {
          throw new Error('Bad response from server');
        }
        return res.json();
      })
      .then((repositoryItems) => {
        console.log('repositoryItems', repositoryItems);
        setRepositoryItems(repositoryItems);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const loadCustomNodesItems = () => {
    const { signal } = abortableControllerRef.current;
    fetch('/api/module?codeName=customNodes', { signal })
      .then((res) => {
        if (res.status >= 400) {
          throw new Error('Bad response from server');
        }
        return res.json();
      })
      .then((customNodes) => {
        console.log('customNodes', customNodes);
        setCustomNodes(customNodes);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    const controller = new AbortController();
    abortableControllerRef.current = controller;
    return () => {
      console.log('loadTasks - aborted');
      controller.abort();
    };
  }, []);

  useEffect(() => {
    console.log('USEEFFECT taskbar : trigger loadTasks', metaDataInfo.length);
    if (canvasMode.flowType !== '') {
      loadTasks();
      if (props.hasCustomNodesAndRepository) {
        loadRepositoryItems();
        loadCustomNodesItems();
      }
    }
  }, [canvasMode.flowType, props.hasCustomNodesAndRepository]);

  useEffect(() => {
    if (modulesMenu.isOpen) {
      setMenuMode(TaskMenuMode.modules);
      loadModules();
    } else {
      setMenuMode(TaskMenuMode.tasks);
    }
  }, [modulesMenu.isOpen]);

  useEffect(() => {
    if (metaDataInfo.length > 0) {
      let loadingElement = document.getElementById('loading');
      if (loadingElement && !loadingElement.classList.contains('loaded')) {
        loadingElement.classList.add('loaded');
        setTimeout(() => {
          let loadingElement = document.getElementById('loading');
          if (loadingElement) {
            loadingElement.classList.add('hidden');
          }
        }, 350);
      }
    }
  }, [metaDataInfo]);

  const onShowTests = (event) => {
    event.preventDefault();
    modulesMenu.showModule('tests');
    return false;
  };

  const onShowModule = (module: IModule, event) => {
    event.preventDefault();
    modulesMenu.showModule(module.name, module.id, module.moduleType);
    return false;
  };

  const onDragStart = (event) => {
    // event.target.id
    event.dataTransfer.setData('data-task', event.target.getAttribute('data-task'));
  };

  const renderRect = (className, taskMetaData) => {
    let html5DragAndDrop = false;
    const shapeType = FlowToCanvas.getShapeType('Rect', className, false);

    if (shapeType == 'Circle') {
      return (
        <div
          className="taskbar__task"
          title={className}
          data-task={className}
          draggable={html5DragAndDrop}
          onDragStart={onDragStart}
        >
          <div className="taskbar__taskname">{taskMetaData.title || className}</div>
        </div>
      );
    }

    if (shapeType == 'Ellipse') {
      return (
        <div
          className="taskbar__task"
          title={className}
          data-task={className}
          draggable={html5DragAndDrop}
          onDragStart={onDragStart}
        >
          <div className="taskbar__taskname">{className}</div>
        </div>
      );
    }

    if (shapeType == 'Diamond') {
      return (
        <div
          className="taskbar__task"
          title={className}
          data-task={className}
          draggable={html5DragAndDrop}
          onDragStart={onDragStart}
        >
          <div className="taskbar__taskname">{className}</div>
          {taskMetaData.icon ? (
            <span className={'taskbar__task-icon fas ' + taskMetaData.icon}></span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
              <polygon points="8,2,14,8,8,14,2,8" className="taskbar__task-circle" />
            </svg>
          )}
        </div>
      );
    }

    return (
      <div
        id={`task_${className}`}
        className="taskbar__task"
        title={taskMetaData.title || className}
        data-task={className}
        data-id={taskMetaData.id ?? ''}
        draggable={html5DragAndDrop}
        onDragStart={onDragStart}
      >
        <div className="taskbar__taskname">{taskMetaData.title || className}</div>
        {taskMetaData.icon && <span className={'taskbar__task-icon fas ' + taskMetaData.icon}></span>}
      </div>
    );
  };

  if (canvasMode.flowType === '') {
    return <></>;
  }

  if (menuMode == TaskMenuMode.tasks && metaDataInfo.length <= 1) {
    return <></>;
  }

  let showCoreCategory = false;
  let showStateCategory = false;
  let showAnnotationsCategory = false;
  let showUICategory = false;
  const coreTasks = [
    'AssignTask',
    'IfConditionTask',
    'ExpressionTask',
    'CreateListTask',
    'ApiProxyTask',
    'DataGridTask',
  ];
  const stateTasks = [
    'State',
    'Event',
    'Guard',
    'Action',
    'OnStartFlow',
    'StateChangeTriggerTask',
    'StateMachine',
    'StartState',
    'Variable',
    'VariableChangeTriggerTask',
  ];
  const uiTasks = ['FormTask', 'DataTableTask', 'DebugTask'];
  const annotationTasks = ['AnnotationActor', 'AnnotationText'];
  if (menuMode === TaskMenuMode.tasks) {
    showCoreCategory =
      metaDataInfo.filter((metaData) => {
        return coreTasks.find((item) => item === metaData.className);
      }).length > 0;

    showStateCategory =
      metaDataInfo.filter((metaData) => {
        return stateTasks.find((item) => item === metaData.className);
      }).length > 0;

    showUICategory =
      metaDataInfo.filter((metaData) => {
        return uiTasks.find((item) => item === metaData.className);
      }).length > 0;

    showAnnotationsCategory =
      metaDataInfo.filter((metaData) => {
        return annotationTasks.find((item) => item === metaData.className);
      }).length > 0;
  }
  return (
    <>
      <div className="taskbar" style={{ pointerEvents: props.isDragging ? 'none' : 'auto' }}>
        {hasLoaded && menuMode == TaskMenuMode.tasks ? (
          <div className="taskbar__ribbon">
            <>
              {showCoreCategory && (
                <div className="p-1 tw-mt-0 tw-bg-gray-300">
                  <h2>Core</h2>
                </div>
              )}
              {hasLoaded &&
                showCoreCategory &&
                metaDataInfo.map((taskMetaData: any, index) => {
                  if (coreTasks.find((item) => item === taskMetaData.className)) {
                    return (
                      <Draggable id={taskMetaData.className} key={taskMetaData.className}>
                        {renderRect(taskMetaData.className, taskMetaData)}
                      </Draggable>
                    );
                  }
                  return null;
                })}
              {showUICategory && (
                <div className="p-1 tw-mt-4 tw-bg-gray-300">
                  <h2>UI</h2>
                </div>
              )}
              {hasLoaded &&
                showUICategory &&
                metaDataInfo.map((taskMetaData: any, index) => {
                  if (uiTasks.find((item) => item === taskMetaData.className)) {
                    return (
                      <Draggable id={taskMetaData.className} key={taskMetaData.className}>
                        {renderRect(taskMetaData.className, taskMetaData)}
                      </Draggable>
                    );
                  }
                  return null;
                })}
              {showAnnotationsCategory && (
                <div className="p-1 tw-mt-4 tw-bg-gray-300">
                  <h2>Annotations</h2>
                </div>
              )}
              {hasLoaded &&
                showAnnotationsCategory &&
                metaDataInfo.map((taskMetaData: any, index) => {
                  if (annotationTasks.find((item) => item === taskMetaData.className)) {
                    return (
                      <Draggable id={taskMetaData.className} key={taskMetaData.className}>
                        {renderRect(taskMetaData.className, taskMetaData)}
                      </Draggable>
                    );
                  }
                  return null;
                })}
              {showStateCategory && (
                <div className="p-1 tw-mt-4 tw-bg-gray-300">
                  <h2>Statemachine</h2>
                </div>
              )}
              {hasLoaded &&
                showStateCategory &&
                metaDataInfo.map((taskMetaData: any, index) => {
                  if (stateTasks.find((item) => item === taskMetaData.className)) {
                    return (
                      <Draggable id={taskMetaData.className} key={taskMetaData.className}>
                        {renderRect(taskMetaData.className, taskMetaData)}
                      </Draggable>
                    );
                  }
                  return null;
                })}
              {showCoreCategory && (
                <div className="p-1 tw-mt-4 tw-bg-gray-300">
                  <h2>Other</h2>
                </div>
              )}
              {hasLoaded &&
                metaDataInfo.map((taskMetaData: any, index) => {
                  if (showCoreCategory) {
                    if (coreTasks.find((item) => item === taskMetaData.className)) {
                      return null;
                    }
                  }
                  if (showStateCategory) {
                    if (stateTasks.find((item) => item === taskMetaData.className)) {
                      return null;
                    }
                  }
                  if (showAnnotationsCategory) {
                    if (annotationTasks.find((item) => item === taskMetaData.className)) {
                      return null;
                    }
                  }
                  return (
                    <Draggable id={taskMetaData.className} key={taskMetaData.className}>
                      {renderRect(taskMetaData.className, taskMetaData)}
                    </Draggable>
                  );
                })}
              <div>
                {hasLoaded && repositoryItems && repositoryItems.items && repositoryItems.items.length > 0 && (
                  <div className="p-1 tw-mt-4 tw-bg-gray-300">
                    <h2>Repository</h2>
                  </div>
                )}
                {hasLoaded &&
                  repositoryItems &&
                  repositoryItems.items &&
                  repositoryItems.items.map((repoItem: any, index) => {
                    const taskRepoItem: any = {
                      className: 'repo-item' + index,
                      id: repoItem.id,
                      title: repoItem.name,
                    };

                    return (
                      <Draggable id={taskRepoItem.className} key={taskRepoItem.className}>
                        {renderRect(taskRepoItem.className, taskRepoItem)}
                      </Draggable>
                    );
                  })}
              </div>
              <div>
                {hasLoaded && customNodes && customNodes.items && customNodes.items.length > 0 && (
                  <div className="p-1 tw-mt-4 tw-bg-gray-300">
                    <h2>CustomNodes</h2>
                  </div>
                )}
                {hasLoaded &&
                  customNodes &&
                  customNodes.items &&
                  customNodes.items.map((customNode: any, index) => {
                    const taskCustomNode: any = {
                      className: 'custom-node' + index,
                      id: customNode.id,
                      title: customNode.name,
                    };

                    return (
                      <Draggable id={taskCustomNode.className} key={taskCustomNode.className}>
                        {renderRect(taskCustomNode.className, taskCustomNode)}
                      </Draggable>
                    );
                  })}
              </div>
            </>
          </div>
        ) : (
          <>
            {modules.map((module, index) => {
              return (
                <button
                  key={'module-' + index}
                  onClick={(event) => onShowModule(module, event)}
                  className="btn btn-outline-primary w-100 mb-2"
                >
                  {module.name}
                </button>
              );
            })}
            {canvasMode.flowType == 'playground' && (
              <button onClick={onShowTests} className="btn btn-outline-primary w-100">
                Tests
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
};
