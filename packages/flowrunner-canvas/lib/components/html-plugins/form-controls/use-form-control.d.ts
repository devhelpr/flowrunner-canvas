import * as React from 'react';
export declare const useFormControl: (initialValue: any, metaInfo: any, sendChange: (value: any, metaInfo: any) => void) => {
    value: any;
    onChange: (event: any) => void;
    setValue: React.Dispatch<any>;
};
export declare const useFormControlFromCode: (initialValue: any, metaInfo: any, sendChange: (value: any, metaInfo: any) => void) => {
    value: any;
    onChange: (event: any) => void;
    handleChangeByValue: (value: any) => void;
    setValue: React.Dispatch<any>;
    sendChangeDirect: (value: any) => void;
};
