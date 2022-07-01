import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from 'react';
import { getCurrentStateMachine } from '../../../state-machine';
import { useFormControlFromCode } from './use-form-control';
export const StateMachineEventButton = (props) => {
    const { metaInfo, node } = props;
    let formControl = useFormControlFromCode(props.value, metaInfo, props.onChange);
    useEffect(() => {
        formControl.setValue(props.value);
    }, [props.value]);
    return _jsx("div", { className: `form-group ${props.fieldIndex > 0 ? "tw-mt-2 tw-mb-2" : "tw-mb-2"}`, children: _jsx("button", { className: `btn btn-primary tw-w-full`, disabled: !props.enabled, onClick: (event) => {
                event.preventDefault();
                const stateMachine = getCurrentStateMachine();
                stateMachine.event(metaInfo.defaultValue, props.payload);
                return false;
            }, children: metaInfo.label || metaInfo.fieldName || node.name }) });
};
//# sourceMappingURL=stateMachineEventButton.js.map