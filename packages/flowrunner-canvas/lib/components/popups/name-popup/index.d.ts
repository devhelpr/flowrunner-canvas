export interface NamePopupProps {
    nameCaption: string;
    onClose: () => void;
    onSave: (name: string) => void;
}
export declare const NamePopup: (props: NamePopupProps) => JSX.Element;
