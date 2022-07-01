import { ICanvasModeState } from '../../state/canvas-mode-state';
export interface IFloatingToolbarProps {
    useCanvasModeStateStore: () => ICanvasModeState;
}
export declare const FloatingToolbar: (props: IFloatingToolbarProps) => JSX.Element;
