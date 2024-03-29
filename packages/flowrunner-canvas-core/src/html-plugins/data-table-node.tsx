import * as React from 'react';
import { useReceivedPayload } from '../hooks/use-received-payload';

import { IFlowrunnerConnector } from '../interfaces/IFlowrunnerConnector';

import { v4 } from 'uuid';
const uuidV4 = v4;

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
  const { payload } = useReceivedPayload(props.flowrunnerConnector, props.node, props.flow);
  if (!props.node.dataPropertyName || !payload || !payload[props.node.dataPropertyName]) {
    return null;
  }

  const rows = (
    <>
      {payload[props.node.dataPropertyName].map((row, index) => {
        if (index >= 10) {
          return null;
        }
        return (
          <tr
            key={`row_${index}`}
            className={`tw-w-full tw-p-2 tw-align-top tw-text-left ${index % 2 == 0 ? 'tw-bg-slate-100' : ''}`}
          >
            {!!props.node.hasDelete && (
              <td>
                <button
                  type="button"
                  className="fas fa-trash"
                  onClick={(event) => {
                    event.preventDefault();
                    console.log('onDelete', index, row);

                    props.flowrunnerConnector.modifyFlowNode(
                      props.node.name,
                      'onDelete',
                      undefined,
                      undefined,
                      'onDelete',
                      { ...row },
                    );
                    return false;
                  }}
                ></button>
              </td>
            )}

            {!!props.node.hasUpdate && (
              <td>
                <button
                  type="button"
                  className="fas fa-edit"
                  onClick={(event) => {
                    event.preventDefault();
                    console.log('onUpdate', index, row);

                    props.flowrunnerConnector.modifyFlowNode(
                      props.node.name,
                      'onUpdate',
                      undefined,
                      undefined,
                      'onUpdate',
                      { ...row },
                    );
                    return false;
                  }}
                ></button>
              </td>
            )}

            {props.node.columns &&
              props.node.columns.map((column, columnIndex) => {
                return <td key={`column_${index}_${columnIndex}`}>{row[column.columnName]}</td>;
              })}
            {!props.node.columns && <td className="tw-w-full">{row}</td>}
          </tr>
        );
      })}
    </>
  );

  const table = (
    <>
      {
        <table className="tw-w-full">
          <thead className="tw-w-full">
            <tr className="tw-p-2">
              {!!props.node.hasDelete && <th></th>}
              {!!props.node.hasUpdate && <th></th>}
              {props.node.columns &&
                props.node.columns.map((column, index) => (
                  <th key={index} className="tw-text-left">
                    {column.columnName}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      }
    </>
  );

  return (
    <div className="html-plugin-node tw-bg-white tw-items-start tw-self-start">
      <div className="w-100 h-auto">{table}</div>
      {!!props.node.hasCreate && (
        <div>
          <button
            className="tw-mt-2 btn btn-primary"
            onClick={(event) => {
              event.preventDefault();

              props.flowrunnerConnector.modifyFlowNode(props.node.name, 'onCreate', undefined, undefined, 'onCreate', {
                ...payload,
                id: uuidV4(),
              });
              return false;
            }}
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
};
