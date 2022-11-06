import * as React from 'react';
import { useReceivedPayload } from '../hooks/use-received-payload';

import { IFlowrunnerConnector } from '../interfaces/IFlowrunnerConnector';

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

  if (!props.node.dataPropertyName || !props.node.columns || !payload || !payload[props.node.dataPropertyName]) {
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
