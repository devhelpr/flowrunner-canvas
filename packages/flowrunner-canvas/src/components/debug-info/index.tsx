import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { IFlowrunnerConnector, IExecutionEvent } from '@devhelpr/flowrunner-canvas-core';
import { useFlowStore } from '@devhelpr/flowrunner-canvas-core';
import { useCanvasModeStateStore } from '@devhelpr/flowrunner-canvas-core';
import { useSelectedNodeStore } from '@devhelpr/flowrunner-canvas-core';

export interface DebugInfoProps {
  flowrunnerConnector: IFlowrunnerConnector;
}

export interface DebugInfoState {
  payload: any;
  fullscreen: boolean;
}

//class ContainedDebugInfo extends React.Component<DebugInfoProps, DebugInfoState> {
export const DebugInfo = (props: DebugInfoProps) => {
  const htmlElement = useRef(null);
  const timer = useRef(null as any);
  const [payload, setPayload] = useState(undefined);
  const [fullscreen, setFullscreen] = useState(false);
  const flowType = useCanvasModeStateStore((state) => state.flowType);
  const selectedNode = useSelectedNodeStore();
  const [filterValue, setFilterValue] = useState('');

  useEffect(() => {
    props.flowrunnerConnector.registerFlowExecutionObserver('ContainedDebugInfo', (executionEvent: IExecutionEvent) => {
      if (timer.current) {
        clearTimeout(timer.current);
      }

      timer.current = setTimeout(() => {
        if (executionEvent) {
          setPayload(executionEvent.payload);
        }
      }, 50);
    });
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }

      props.flowrunnerConnector.unregisterFlowExecuteObserver('ContainedDebugInfo');
    };
  }, []);

  const onToggleFullscreen = (event) => {
    event.preventDefault();
    setFullscreen(!fullscreen);
    return false;
  };

  if (flowType !== 'playground') {
    return <></>;
  }

  let fullscreenCss = '';
  let iconCss = 'debug-info__window-maximize far fa-window-maximize';
  if (fullscreen) {
    fullscreenCss = ' debug-info--fullscreen';
    iconCss = 'debug-info__window-maximize far fa-window-minimize';
  }
  if (selectedNode && selectedNode.node && selectedNode.node.name) {
    if (selectedNode.node.payload) {
      const debugInfo = JSON.stringify(selectedNode.node.payload, null, 2);
      return (
        <div className={'debug-info' + fullscreenCss}>
          <div className="debug-info__debug-info">
            <a href="#" onClick={onToggleFullscreen} className={iconCss}></a>
            <div className="debug-info__debug-info-content">
              <strong>{selectedNode.node.name}</strong>
              <br />
              {fullscreen && (
                <>
                  <input
                    className="form-control"
                    value={filterValue}
                    onChange={(event) => setFilterValue(event.target.value)}
                  />
                  <br />
                </>
              )}
              {debugInfo}
            </div>
          </div>
        </div>
      );
    } else {
      let list = props.flowrunnerConnector.getNodeExecutionsByNodeName(selectedNode.node.name);

      if (list && list.length > 0 && list[list.length - 1]) {
        let payload = { ...list[list.length - 1].payload };
        if (payload && payload.debugId) {
          delete payload.debugId;
        }
        if (payload && payload.nodeExecutionId) {
          delete payload.nodeExecutionId;
        }
        let orgPayload = { ...payload };
        if (fullscreen && filterValue) {
          let previewPayload: any = {};
          Object.keys(payload).forEach((keyName) => {
            if (keyName.toLowerCase().indexOf(filterValue.toLowerCase()) === 0) {
              previewPayload[keyName] = payload[keyName];
            }
          });
          payload = previewPayload;
        }
        const debugInfo = JSON.stringify(payload, null, 2);
        return (
          <div className={'debug-info' + fullscreenCss}>
            <div className="debug-info__debug-info">
              <a href="#" onClick={onToggleFullscreen} className={iconCss}></a>
              <div className="debug-info__debug-info-content">
                <strong>{selectedNode.node.name}</strong>
                <br />
                {fullscreen && (
                  <>
                    <select
                      className="form-control tw-sticky tw-top-0"
                      value={filterValue}
                      onChange={(event) => setFilterValue(event.target.value)}
                    >
                      <option value="">Show full payload</option>
                      {Object.keys(orgPayload)
                        .filter(
                          (value) =>
                            value.indexOf('_') !== 0 && ['request', 'response', 'followFlow'].indexOf(value) < 0,
                        )
                        .sort()
                        .map((keyName, index) => {
                          return (
                            <option key={index} value={keyName}>
                              {keyName}
                            </option>
                          );
                        })}
                    </select>
                    <br />
                  </>
                )}
                {debugInfo}
              </div>
            </div>
          </div>
        );
      }
    }
  }

  return null;
};
