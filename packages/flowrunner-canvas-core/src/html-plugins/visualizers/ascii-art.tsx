import * as React from 'react';
import { replaceValues } from '../../helpers/replace-values';

export interface IAsciiArtProps {
  node: any;
  payloads: any[];
}

export const AsciiArt = (props: IAsciiArtProps) => {
  const { node } = props;
  let data = <></>;
  if (props.payloads.length > 0) {
    const payload = props.payloads[props.payloads.length - 1];
    if (payload && node && node.propertyName && node.columns) {
      const columns = parseInt(node.columns) || 0;
      if (!columns || !payload[node.propertyName]) {
        return <></>;
      }
      let stringToParse: string = payload[node.propertyName].toString();
      while (stringToParse) {
        const stringToPrint = stringToParse.slice(0, columns);
        stringToParse = stringToParse.slice(columns, stringToParse.length);
        data = (
          <>
            {data}
            {stringToPrint}
            <br />
          </>
        );
      }
    }
  }
  return (
    <div className="static-text-visualizer h-auto d-flex align-items-center">
      <span className={`tw-whitespace-nowrap tw-font-mono tw-leading-none tw-p-1 ${props.node.cssClassName || ''}`}>
        {data}
      </span>
    </div>
  );
};
