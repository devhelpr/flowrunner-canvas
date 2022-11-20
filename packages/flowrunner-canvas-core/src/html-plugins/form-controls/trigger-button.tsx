import * as React from 'react';
import { useEffect } from 'react';
import { replaceValues } from '../../helpers/replace-values';

import { IFormControlProps } from './form-control-interface';
import { useFormControlFromCode } from './use-form-control';

export const TriggerButton = (props: IFormControlProps) => {
  const { metaInfo, node } = props;
  let formControl = useFormControlFromCode(props.value, metaInfo, props.onChange);

  useEffect(() => {
    formControl.setValue(props.value);
  }, [props.value]);

  const values = { ...props.currentFormValues, ...props.payload };

  let disabled = !props.enabled;
  if (props.fieldDefinition.enabledIfPropertyIsTruthy) {
    if (!values[props.fieldDefinition.enabledIfPropertyIsTruthy]) {
      disabled = true;
    }
  }

  return (
    <div className={`form-group ${props.fieldIndex > 0 ? 'tw-mt-2 tw-mb-2' : 'tw-mb-2'}`}>
      <button
        className={`btn btn-primary tw-w-full`}
        disabled={disabled}
        onClick={(event) => {
          event.preventDefault();
          if (props.node.formMode === 'crud') {
            if (props.onCanSubmitForm && !props.onCanSubmitForm()) {
              return false;
            }
          }
          if (props.flowrunnerConnector) {
            props.flowrunnerConnector?.modifyFlowNode(props.node.name, props.fieldName, 'trigger', props.node.name, '');

            //props.flowrunnerConnector.executeFlowNode(props.node.name, props.payload || {});
          }
          return false;
        }}
      >
        {metaInfo.label || metaInfo.fieldName || node.name}
      </button>
    </div>
  );
};
