import * as React from 'react';
import { useState, useRef, useEffect, useLayoutEffect } from 'react';

import { Modal, Button } from 'react-bootstrap';
import { IFlowrunnerConnector } from '@devhelpr/flowrunner-canvas-core';
import { useFlowStore } from '@devhelpr/flowrunner-canvas-core';
import { useSelectedNodeStore } from '@devhelpr/flowrunner-canvas-core';

export interface EditPopupProps {
  flowrunnerConnector: IFlowrunnerConnector;

  onClose: (pushFlow?: boolean) => void;
}

export const EditPopup = (props: EditPopupProps) => {
  const [preshow, setPreShow] = useState(false);
  const [show, setShow] = useState(false);
  const [value, setValue] = useState('');
  const [orgNodeName, setOrgNodeName] = useState('');
  const [orgNodeValues, setOrgNodeValues] = useState({});
  const [requiredNodeValues, setRequiredNodeValues] = useState({});

  const containerRef = useRef(null);

  const flow = useFlowStore();
  const selectedNode = useSelectedNodeStore();

  useLayoutEffect(() => {
    // this is needed to prevent unnessary rerender because of the container ref reference
    // when this is not here, the component rerenders after first input in input controls
    setPreShow(true);
  }, [preshow]);

  useEffect(() => {
    setShow(true);
  }, []);

  useEffect(() => {
    const node = { ...selectedNode.node.node };
    let newRequiredNodeValues;
    if (node.shapeType !== 'Line') {
      newRequiredNodeValues = {
        _id: node._id,
        id: node.id,
        x: node.x,
        y: node.y,
        shapeType: node.shapeType,
      };

      delete node.x;
      delete node.y;
    } else {
      newRequiredNodeValues = {
        _id: node._id,
        id: node.id,
        startshapeid: node.startshapeid,
        endshapeid: node.endshapeid,
        xstart: node.xstart,
        ystart: node.ystart,
        xend: node.xend,
        yend: node.yend,
        shapeType: node.shapeType,
        taskType: node.taskType,
      };

      delete node.startshapeid;
      delete node.endshapeid;
      delete node.xstart;
      delete node.ystart;
      delete node.xend;
      delete node.yend;
      delete node.taskType;
    }

    delete node._id;
    delete node.id;
    delete node.shapeType;
    delete node.observable;
    console.log('EditPopup', node);
    setValue(JSON.stringify(node, null, 2));
    setOrgNodeName(selectedNode.node.name);
    setOrgNodeValues({ ...selectedNode.node });
    setRequiredNodeValues(newRequiredNodeValues);
  }, []);

  const saveNode = (e) => {
    try {
      const changedProperties = JSON.parse(value);

      if (changedProperties.id !== undefined) {
        delete changedProperties.id;
      }

      const node = { ...requiredNodeValues, ...changedProperties };
      flow.storeFlowNode(node, orgNodeName);

      props.flowrunnerConnector.modifyFlowNode(orgNodeName, '', '', orgNodeName, '', node);

      selectedNode.selectNode(node.name, node);
      props.onClose(true);
    } catch (err) {
      alert("The json in the 'Node JSON' field is invalid");
    }

    e.preventDefault();
    return false;
  };

  const onCloseClick = (event) => {
    event.preventDefault();
    props.onClose();
    return false;
  };

  return (
    <div ref={(ref) => ((containerRef as any).current = ref)}>
      <Modal show={show} centered size="xl" container={containerRef.current}>
        <Modal.Header>
          <Modal.Title>Edit Node JSON</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="form-group">
            <label>Node JSON</label>
            <textarea
              className="form-control edit-popup__json"
              rows={8}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
              }}
            ></textarea>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <button className="btn btn-secondary" onClick={onCloseClick}>
            Close
          </button>
          <button className="btn btn-primary" onClick={saveNode}>
            Save
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
