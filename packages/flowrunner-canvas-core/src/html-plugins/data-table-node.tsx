import * as React from 'react';
import { useEffect, useState, useCallback, useRef } from 'react';

import { IFlowrunnerConnector } from '../interfaces/IFlowrunnerConnector';

import * as uuid from 'uuid';
const uuidV4 = uuid.v4;

export class DataTableNodeHtmlPluginInfo {
  getWidth = (node) => {
    const columnsCount = (node.columns || []).length;

    return (node && columnsCount && (columnsCount + 1) * 100 + 24) || 250;
  };

  getHeight(node) {
    return 250;
  }
}

export interface DataTableNodeHtmlPluginProps {
  flowrunnerConnector: IFlowrunnerConnector;
  node: any;
  flow: any;
}

export const DataTableNodeHtmlPlugin = (props: DataTableNodeHtmlPluginProps) => {
  const [receivedPayload, setReceivedPayload] = useState<any>({});
  const observableId = useRef(uuidV4());
  const unmounted = useRef(false);

  const receivedPayloads = useRef([] as any[]);

  useEffect(() => {
    unmounted.current = false;
    console.log('DataTableNodeHtmlPlugin mount');
    props.flowrunnerConnector.registerFlowNodeObserver(props.node.name, observableId.current, receivePayloadFromNode);
    return () => {
      console.log('DataTableNodeHtmlPlugin unmount');
      props.flowrunnerConnector.unregisterFlowNodeObserver(props.node.name, observableId.current);
      unmounted.current = true;
    };
  }, []);

  useEffect(() => {
    unmounted.current = false;
    console.log('DataTableNodeHtmlPlugin mount nf');

    props.flowrunnerConnector.registerFlowNodeObserver(props.node.name, observableId.current, receivePayloadFromNode);
    return () => {
      unmounted.current = true;
      console.log('DataTableNodeHtmlPlugin unmount nf');
      props.flowrunnerConnector.unregisterFlowNodeObserver(props.node.name, observableId.current);
    };
  }, [props.node, props.flow]);

  const receivePayloadFromNode = useCallback(
    (payload: any) => {
      console.log('data-table-node payload', payload);
      if (unmounted.current) {
        return;
      }
      if (!!payload.isDebugCommand) {
        if (payload.debugCommand === 'resetPayloads') {
          if (receivedPayloads.current.length > 0) {
            receivedPayloads.current = [];
            setReceivedPayload({});
          }
        }
        return;
      }

      let newReceivedPayloads: any[] = [...receivedPayloads.current];
      newReceivedPayloads.push({ ...payload });
      if (newReceivedPayloads.length > 1) {
        newReceivedPayloads = newReceivedPayloads.slice(Math.max(newReceivedPayloads.length - 1, 0));
      }
      receivedPayloads.current = newReceivedPayloads;

      setReceivedPayload({ ...payload });

      return;
    },
    [props.node, props.flow],
  );
  console.log('data-table-node', props.node, receivedPayload);
  if (
    !props.node.dataPropertyName ||
    !props.node.columns ||
    !receivedPayload ||
    !receivedPayload[props.node.dataPropertyName]
  ) {
    return null;
  }

  const rows = (
    <>
      {receivedPayload[props.node.dataPropertyName].map((row, index) => {
        if (index >= 10) {
          return null;
        }
        return (
          <tr
            key={`row_${index}`}
            className={`tw-p-2 tw-align-top tw-text-left ${index % 2 == 0 ? 'tw-bg-slate-100' : ''}`}
          >
            {props.node.columns.map((column, columnIndex) => {
              return <td key={`column_${index}_${columnIndex}`}>{row[column.columnName]}</td>;
            })}
          </tr>
        );
      })}
    </>
  );
  const table = (
    <>
      {
        <table>
          <thead>
            {props.node.columns.map((column, index) => (
              <th key={index} className="tw-text-left tw-p-2">
                {column.columnName}
              </th>
            ))}
          </thead>
          <tbody>{rows}</tbody>
        </table>
      }
    </>
  );

  return (
    <div className="html-plugin-node tw-bg-white tw-items-start tw-self-start">
      <div className="w-100 h-auto">{table}</div>
    </div>
  );
};
