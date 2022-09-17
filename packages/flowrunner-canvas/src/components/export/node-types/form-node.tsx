import { INode, ShapeSettings } from '@devhelpr/flowrunner-canvas-core';
import * as React from 'react';
import { getColor } from '../utils/color';
import { INodeTypeProps } from './node-type-props';

export const FormNode = (props: INodeTypeProps) => {
  const { node, minX, minY, width, height } = props;
  const settings = ShapeSettings.getShapeSettings(node.taskType, node) as unknown as any;
  let metaInfo: any[] = [];
  if (settings && settings.hasMetaInfoInNode) {
    metaInfo = (node as any).metaInfo;
  } else if (settings && settings.metaInfo) {
    metaInfo = settings.metaInfo;
  }

  return (
    <>
      <rect
        x={node.x - minX}
        y={node.y - minY}
        width={width}
        height={height}
        style={{ fill: getColor(settings) || 'white', stroke: 'black', strokeWidth: 2 }}
        rx="15"
      />
      <line
        x1={node.x - minX}
        y1={node.y - minY + 32}
        x2={node.x - minX + width}
        y2={node.y - minY + 32}
        stroke="black"
      />
      <text
        x={node.x - minX + width / 2}
        y={node.y - minY + 18}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fontFamily: 'arial, sans-serif', fontWeight: 500, fontSize: 18 }}
      >
        {node.label || node.taskType}
      </text>
      <>
        {metaInfo.map((field, index) => (
          <text
            key={`${node.name}_text_${index}`}
            x={node.x - minX + 8}
            y={node.y - minY + 64 + index * 24}
            style={{ fontFamily: 'arial, sans-serif', fontWeight: 500, fontSize: 18 }}
          >
            {field.fieldName}
          </text>
        ))}
      </>
    </>
  );
};
