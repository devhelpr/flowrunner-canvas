import * as React from 'react';
import { useEffect } from 'react';

import { IFormControlProps } from './form-control-interface';
import { useFormControlFromCode } from './use-form-control';

export const Icon = (props: IFormControlProps) => {
  const { metaInfo, node } = props;
  let formControl = useFormControlFromCode(props.value, metaInfo, props.onChange);
  useEffect(() => {
    formControl.setValue(props.value);
  }, [props.value]);

  return (
    <div className="form-group">
      <span
        className={`${metaInfo.iconClasses} tw-text-${metaInfo.iconSize}`}
        id={'icon-' + props.node.name + '-' + metaInfo.fieldName}
      />
    </div>
  );
};
