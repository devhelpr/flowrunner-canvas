import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { IFlowrunnerConnector, IExecutionEvent } from '@devhelpr/flowrunner-canvas-core';
import { useFlowStore } from '@devhelpr/flowrunner-canvas-core';
import { useCanvasModeStateStore } from '@devhelpr/flowrunner-canvas-core';
import { useSelectedNodeStore } from '@devhelpr/flowrunner-canvas-core';
import {
  getDebugContextsForNode,
  getDebugInfoForNodeAndContext,
} from 'packages/flowrunner-canvas-core/src/debug-info/debug-info';
import context from 'react-bootstrap/esm/AccordionContext';

export interface DebugInfoProps {
  flowrunnerConnector: IFlowrunnerConnector;
}

export interface DebugInfoState {
  payload: any;
  fullscreen: boolean;
}

interface ISelectedContext {
  selectedContexts: any[];
}

const SelectedContext = (props: ISelectedContext) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  if (props.selectedContexts.length > 0) {
    return (
      <>
        <div className="tw-mb-1">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              if (selectedIndex > 0) {
                setSelectedIndex((selectedIndex) => selectedIndex - 1);
              }
            }}
          >
            Previous
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              if (selectedIndex < props.selectedContexts.length - 1) {
                setSelectedIndex((selectedIndex) => selectedIndex + 1);
              }
            }}
          >
            Next
          </button>
          <span className="tw-ml-1">
            {selectedIndex + 1} / {props.selectedContexts.length}
          </span>
        </div>
        {JSON.stringify(props.selectedContexts[selectedIndex]?.payload ?? {}, null, 2)}
      </>
    );
  }
  return <></>;
};

//class ContainedDebugInfo extends React.Component<DebugInfoProps, DebugInfoState> {
export const DebugInfo = (props: DebugInfoProps) => {
  const htmlElement = useRef(null);
  const timer = useRef(null as any);
  const [payload, setPayload] = useState(undefined);
  const [fullscreen, setFullscreen] = useState(false);
  const flowType = useCanvasModeStateStore((state) => state.flowType);
  const selectedNode = useSelectedNodeStore();
  const [filterValue, setFilterValue] = useState('');
  const [debugContexts, setDebugContexts] = useState<string[]>([]);
  const [debugContextIdValue, setDebugContextIdValue] = useState<string>('');
  const [selectedContexts, setSelectedContexts] = useState<any[] | null>(null);
  useEffect(() => {
    props.flowrunnerConnector.registerFlowExecutionObserver('ContainedDebugInfo', (executionEvent: IExecutionEvent) => {
      if (timer.current) {
        clearTimeout(timer.current);
      }

      timer.current = setTimeout(() => {
        if (executionEvent) {
          setPayload(executionEvent.payload);
          if (selectedNode && selectedNode.node && selectedNode.node.name) {
            const contexts = getDebugContextsForNode(selectedNode.node.name);
            setDebugContexts(contexts);
          } else {
            setDebugContexts([]);
          }
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

  useEffect(() => {
    if (selectedNode && selectedNode.node && selectedNode.node.name) {
      const contexts = getDebugContextsForNode(selectedNode.node.name);
      setSelectedContexts(null);
      setDebugContexts(contexts);
    } else {
      setSelectedContexts(null);
      setDebugContexts([]);
    }
  }, [selectedNode]);

  useEffect(() => {
    if (debugContextIdValue) {
      if (selectedNode && selectedNode.node && selectedNode.node.name) {
        setSelectedContexts(getDebugInfoForNodeAndContext(selectedNode.node.name, debugContextIdValue));
      } else {
        setSelectedContexts(null);
      }
    } else {
      setSelectedContexts(null);
    }
  }, [debugContextIdValue, selectedNode]);

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
                    {debugContexts && debugContexts.length > 0 && (
                      <select
                        className="form-control tw-sticky tw-top-0"
                        value={debugContextIdValue}
                        onChange={(event) => setDebugContextIdValue(event.target.value)}
                      >
                        <option value="">Select debug context</option>
                        {debugContexts.map((debugContextId, index) => {
                          return (
                            <option key={`debugContext-${index}`} value={debugContextId}>
                              {debugContextId}
                            </option>
                          );
                        })}
                      </select>
                    )}
                    {selectedContexts && selectedContexts.length > 0 ? (
                      <></>
                    ) : (
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
                    )}
                    <br />
                  </>
                )}
                {fullscreen && selectedContexts && selectedContexts.length > 0 ? (
                  <SelectedContext selectedContexts={selectedContexts} />
                ) : (
                  debugInfo
                )}
              </div>
            </div>
          </div>
        );
      }
    }
  }

  return null;
};
