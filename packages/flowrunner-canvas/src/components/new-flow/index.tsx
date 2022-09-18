import * as React from 'react';
import { useState, useRef, useEffect, useLayoutEffect } from 'react';

import { Modal, Button } from 'react-bootstrap';

//import fetch from 'cross-fetch';

import { useFlowStore } from '@devhelpr/flowrunner-canvas-core';
import { useCanvasModeStateStore } from '@devhelpr/flowrunner-canvas-core';
import { IFlowrunnerConnector } from '@devhelpr/flowrunner-canvas-core';

export interface IExampleFlow {
  exampleName: string;
  exampleTitle: string;
}
export interface NewFlowProps {
  onClose: () => void;
  onSave: (id: number | string, flowType: string) => void;
  onGetExamples: undefined | (() => Promise<IExampleFlow[]>);
  onGetExampleFlow: undefined | ((exampleName: string) => Promise<any[]>);
  flowrunnerConnector: IFlowrunnerConnector;
}

export const NewFlow = (props: NewFlowProps) => {
  const [preshow, setPreShow] = useState(false);
  const [show, setShow] = useState(false);
  const [value, setValue] = useState('');
  const [orgNodeName, setOrgNodeName] = useState('');
  const [orgNodeValues, setOrgNodeValues] = useState({});
  const [requiredNodeValues, setRequiredNodeValues] = useState({});
  const [flowType, setFlowType] = useState('playground');
  const [addJSONFlow, setAdJSONFlow] = useState(false);
  const [cloneJSONFlow, setCloneJSONFlow] = useState(false);
  const [json, setJSON] = useState('');
  const [exampleFlow, setExampleFlow] = useState('');
  const [exampleFlows, setExampleFlows] = useState<IExampleFlow[]>([]);

  const containerRef = useRef(null);

  const flow = useFlowStore();
  const canvasMode = useCanvasModeStateStore();

  useLayoutEffect(() => {
    if (props.onGetExamples) {
      props.onGetExamples().then((list) => {
        setExampleFlows(list);
      });
    }
  }, []);

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

  const storeFlow = (jsonData: any[]) => {
    if (props.flowrunnerConnector.hasStorageProvider) {
      // save to storage
      props.flowrunnerConnector.storageProvider?.addFlow(value, jsonData).then((result: any) => {
        props.onSave(result.id, flowType);
      });
    } else {
      try {
        fetch('/api/flow?flow=' + value + '&flowType=' + flowType + '&addJSONFlow=' + (addJSONFlow || cloneJSONFlow), {
          method: 'post',
          body: JSON.stringify({
            nodes: jsonData,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then((response) => {
            if (response.status >= 400) {
              throw new Error('Bad response from server');
            }
            return response.json();
          })
          .then((result) => {
            props.onSave(result.id, flowType);
          });
      } catch (err) {
        console.log('new-flow err', err);
        alert('Error while adding flow');
      }
    }
  };

  const saveNode = (e) => {
    e.preventDefault();

    if (addJSONFlow) {
      try {
        let flow = JSON.parse(json);
        if (!Array.isArray(flow)) {
          alert('The JSON should be an array of nodes and connections');
          return;
        }
      } catch (err) {
        alert('Error in JSON: ' + err);
        return;
      }
    }

    let jsonData: any = [];
    if (cloneJSONFlow) {
      jsonData = flow.flow;
      storeFlow(jsonData);
    } else {
      if (exampleFlow !== '' && props.onGetExampleFlow) {
        props.onGetExampleFlow(exampleFlow).then((data) => {
          storeFlow(data);
        });
      } else {
        jsonData = JSON.parse(json || '[]');
        storeFlow(jsonData);
      }
    }

    return false;
  };

  const onAddJSONFlow = (event) => {
    event.persist();
    setAdJSONFlow(event.target.checked);
  };

  const onCloneJSONFlow = (event) => {
    event.persist();
    setCloneJSONFlow(event.target.checked);
  };

  const onChangeJson = (event) => {
    event.preventDefault();
    setJSON(event.target.value);
    return false;
  };

  const onChangeFlowName = (event) => {
    event.preventDefault();
    setValue(event.target.value);
    return false;
  };

  const onChangeFlowType = (event) => {
    event.preventDefault();
    setFlowType(event.target.value);
    return false;
  };

  const onChangeExampleFlow = (event) => {
    event.preventDefault();
    setExampleFlow(event.target.value);
    return false;
  };

  return (
    <>
      <div ref={containerRef}></div>
      <Modal show={show} centered size={addJSONFlow ? 'xl' : 'sm'} container={containerRef.current}>
        <Modal.Header>
          <Modal.Title>Add new Flow</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="form-group">
            <label>Flow name</label>
            <input className="form-control" value={value} required onChange={onChangeFlowName}></input>
          </div>
          <div className="form-group">
            <label>Flow type</label>
            <select className="form-control form-select" value={flowType} onChange={onChangeFlowType}>
              <option value="playground">Playground</option>
              <option value="highlevel">Highlevel</option>
              <option value="rustflowrunner">Rust flowrunner</option>
              <option value="mobile-app">Mobile app</option>
              <option value="backend">Backend</option>
            </select>
          </div>
          <div className="form-group">
            <input id="addCloneFlow" type="checkbox" checked={cloneJSONFlow} onChange={onCloneJSONFlow} />
            <label htmlFor="addCloneFlow" className="ms-2">
              Clone current flow
            </label>
          </div>
          <div className="form-group">
            <input id="addJSONFlow" type="checkbox" checked={addJSONFlow} onChange={onAddJSONFlow} />
            <label htmlFor="addJSONFlow" className="ms-2">
              Enter flow as json
            </label>
          </div>
          {addJSONFlow && (
            <div className="form-group">
              <textarea className="form-control" value={json} onChange={onChangeJson}></textarea>
            </div>
          )}
          {!cloneJSONFlow && (
            <div className="form-group">
              <label>Example flow</label>
              <select className="form-control form-select" value={exampleFlow} onChange={onChangeExampleFlow}>
                <option value="">no example</option>
                {exampleFlows.map((example, index) => (
                  <option key={`example${index}`} value={example.exampleName}>
                    {example.exampleTitle}
                  </option>
                ))}
              </select>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <button className="btn btn-secondary" onClick={props.onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={saveNode}>
            Add
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
