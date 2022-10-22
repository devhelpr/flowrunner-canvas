import * as React from 'react';
import { replaceValues } from '../../helpers/replace-values';

export interface IStaticTextProps {
  node: any;
  payloads: any[];
}

export const StaticText = (props: IStaticTextProps) => {
  let data = props.node.text;
  if (props.payloads.length > 0) {
    const payload = props.payloads[props.payloads.length - 1];
    data = replaceValues(props.node.text, payload);
  }
  return (
    <div className="static-text-visualizer h-auto d-flex align-items-center">
      <span className={`text-wrap ${props.node.cssClassName || ''}`}>{data}</span>
    </div>
  );
};
