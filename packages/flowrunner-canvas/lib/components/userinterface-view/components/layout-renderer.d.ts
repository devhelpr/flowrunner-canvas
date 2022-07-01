import { FormComponent, IRootLayout } from '@devhelpr/layoutrunner';
export declare const renderFlowNode: (node: any, rootLayout: any, isInEditMode?: boolean) => JSX.Element | undefined;
export declare const renderLayoutType: (layoutBlock: any, isInForm: boolean, form: FormComponent | undefined, setLayoutVisibleState: (layoutBlockName: string, isVisible: boolean) => void, rootLayout: IRootLayout) => JSX.Element | null | undefined;
