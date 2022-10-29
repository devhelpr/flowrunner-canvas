import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { getRangeFromValues, getRangeValueParameters } from '@devhelpr/expressionrunner';

export interface IEChartsTestProps {
  node?: any;
  payload?: any;
}

const getDatasource = (node: any, payload: any) => {
  let datasource: number[] = [];
  if (node && payload && node.datasource === 'property' && node.propertyName && payload[node.propertyName]) {
    datasource = payload[node.propertyName] as unknown as number[];
  }

  if (node && payload && node.datasource === 'grid-column' && node.gridColumn && payload.values) {
    const columnName = node.gridColumn;
    if (columnName >= 'A' && columnName <= 'Z' && columnName.length === 1) {
      const helperValues = payload.values;
      helperValues.forEach((row) => {
        const numberValue: number = Number(columnName.charCodeAt(0) as number) - 65;
        if (numberValue < row.length) {
          datasource.push(Number((row as string[])[numberValue]) || 0);
        }
      });
    }
  }

  if (node && payload && node.datasource === 'grid-range' && node.gridRange && payload.values) {
    const helperValues = payload.values;
    const range = getRangeFromValues(helperValues, node.gridRange);
    const valueParameterNames = getRangeValueParameters(node.gridRange);
    range.forEach((value, index) => {
      if (helperValues[valueParameterNames[index]]) {
        datasource.push(Number(helperValues[valueParameterNames[index]]) || 0);
      } else {
        datasource.push(Number(value) || 0);
      }
    });
  }

  return datasource;
};

export const EChartsTest = (props: IEChartsTestProps) => {
  const datasource: number[] = useMemo(() => getDatasource(props.node, props.payload), [props.node, props.payload]);

  return (
    <ReactECharts
      style={{ height: '100%', minHeight: '100%', width: '100%', position: 'absolute' }}
      option={{
        legend: { show: false },
        grid: { top: '55%', show: false },
        series: [
          {
            type: 'pie',
            id: 'pie',
            radius: '90%',
            center: ['50%', '50%'],
            emphasis: {
              focus: 'self',
            },
            data: datasource,
            itemStyle: {
              normal: {
                label: {
                  show: false,
                },
                labelLine: {
                  show: false,
                },
              },
            },
          },
        ],
      }}
    />
  );
};

export const getEChartsComponent = (secrets) => {
  return EChartsTest;
};
