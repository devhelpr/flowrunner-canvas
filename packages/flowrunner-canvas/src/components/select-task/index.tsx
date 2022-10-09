import * as React from 'react';
import { useState, useRef, useEffect, useLayoutEffect } from 'react';

import { Modal, Button } from 'react-bootstrap';

//import fetch from 'cross-fetch';

import { FlowToCanvas, getDefaultUITasks, useFlowStore } from '@devhelpr/flowrunner-canvas-core';
import { useCanvasModeStateStore } from '@devhelpr/flowrunner-canvas-core';
import { IFlowrunnerConnector } from '@devhelpr/flowrunner-canvas-core';

export interface SelectTaskProps {
  hasDefaultUITasks: boolean;
  onClose: () => void;
  onSelectedTask: (taskName) => void;
  flowrunnerConnector: IFlowrunnerConnector;
}

export const SelectTask = (props: SelectTaskProps) => {
  const [preshow, setPreShow] = useState(false);
  const [show, setShow] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [searchTask, setSearchTask] = useState('');
  const [metaDataInfo, setMetaDataInfo] = useState([] as any[]);

  const containerRef = useRef(null);

  const flow = useFlowStore();
  const canvasMode = useCanvasModeStateStore();

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

    console.log('setupTasks - setMetaDataInfo');
    setMetaDataInfo(tasks);
    console.log('setupTasks - after setMetaDataInfo', metaDataInfo);
  };

  const loadTasks = () => {
    console.log('loadTasks', metaDataInfo);
    const { signal } = abortableControllerRef.current;
    if (props.flowrunnerConnector.hasStorageProvider) {
      console.log('loadTasks - hasStorageProvider');
      let tasks: any[] = props.flowrunnerConnector.storageProvider?.getTasks() || [];
      setupTasks([...tasks, ...props.flowrunnerConnector.getTasksFromPluginRegistry()]);
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
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useLayoutEffect(() => {
    // this is needed to prevent unnessary rerender because of the container ref reference
    // when this is not here, the component rerenders after first input in input controls
    if (!preshow) {
      setPreShow(true);
    }
  }, [preshow]);

  useEffect(() => {
    setShow(true);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    abortableControllerRef.current = controller;
    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    console.log('USEEFFECT taskbar : trigger loadTasks etc is done now', metaDataInfo.length);
    loadTasks();
  }, [canvasMode.flowType]);

  const onChangeTask = (event) => {
    event.preventDefault();
    setTaskName(event.target.value);
    return false;
  };

  const onChangeSearchTask = (event) => {
    event.preventDefault();
    setSearchTask(event.target.value);

    if (!event.target.value) {
      setTaskName('');
      return false;
    }

    const findTask = metaDataInfo.find(
      (task) => task.className.toLowerCase().indexOf(event.target.value.toLowerCase()) === 0,
    );

    if (findTask) {
      setTaskName(findTask.className);
    } else {
      setTaskName('');
    }

    return false;
  };

  const onSelectTask = (event) => {
    event.preventDefault();
    if (taskName) {
      props.onSelectedTask(taskName);
    }
    return false;
  };

  return (
    <>
      <div ref={containerRef}></div>
      <Modal show={show} centered size={'sm'} container={containerRef.current}>
        <Modal.Header>
          <Modal.Title>Select Task</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="form-group">
            <label>Task type</label>
            <input name="task-input" className="form-control" value={searchTask} onChange={onChangeSearchTask}></input>
            <br />
            <select className="form-control form-select" value={taskName} onChange={onChangeTask}>
              <option value="">-</option>
              {metaDataInfo.map((taskMetaData: any, index) => {
                return <option value={taskMetaData.className}>{taskMetaData.className}</option>;
              })}
            </select>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <button className="btn btn-secondary" onClick={props.onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={onSelectTask}>
            Select
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
