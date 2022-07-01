import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useFormControlFromCode } from './use-form-control';
import { AtomicBlockUtils, EditorState, ContentState, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import { convertToHTML } from 'draft-convert';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import DOMPurify from 'dompurify';
import { onFocus } from './helpers/focus';
export const RichTextEditor = (props) => {
    const { metaInfo, node } = props;
    const [editorState, setEditorState] = useState(() => {
        const contentBlock = htmlToDraft(props.value || "");
        if (contentBlock) {
            const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
            const editorState = EditorState.createWithContent(contentState);
            return editorState;
        }
        else {
            return EditorState.createEmpty();
        }
    });
    let formControl = useFormControlFromCode(props.value, metaInfo, props.onChange);
    useEffect(() => {
        const result = convertContentToHTML();
        formControl.handleChangeByValue(result);
    }, [editorState]);
    useEffect(() => {
        try {
            let currentHtml = convertToHTML(editorState.getCurrentContent());
            if (currentHtml.trim() == props.value.trim()) {
                return;
            }
            const contentBlock = htmlToDraft(props.value);
            if (contentBlock) {
                const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
                const newEditorState = EditorState.createWithContent(contentState);
                const currentSelection = editorState.getSelection();
                const stateWithContentAndSelection = EditorState.forceSelection(editorState, currentSelection);
                setEditorState(stateWithContentAndSelection);
            }
        }
        catch (err) {
            console.log(`Error in Richtexteditor useEffect ${err}`);
        }
    }, [props.value]);
    const handleEditorChange = (state) => {
        setEditorState(state);
    };
    const convertContentToHTML = () => {
        return draftToHtml(convertToRaw(editorState.getCurrentContent()));
    };
    const createMarkup = (html) => {
        return {
            __html: DOMPurify.sanitize(html)
        };
    };
    const insertImage = (url) => {
        console.log(`insertImage ${url}`);
        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity("IMAGE", "IMMUTABLE", { src: `/media/${url.name}` });
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });
        return AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, " ");
    };
    const uploadImageCallBack = (file) => {
        return new Promise((resolve, reject) => {
            console.log("uploadImageCallBack", file);
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/media');
            const data = new FormData();
            data.append('image', file);
            xhr.send(data);
            xhr.addEventListener('load', () => {
                console.log("uploadImageCallBack load", xhr.responseText);
                const response = JSON.parse(xhr.responseText);
                resolve({
                    data: {
                        link: `/media/${response.data.name}`
                    }
                });
            });
            xhr.addEventListener('error', () => {
                console.log("uploadImageCallBack error", xhr.responseText);
                const error = JSON.parse(xhr.responseText);
                reject(error);
            });
        });
    };
    return _jsxs("div", { className: "form-group", children: [_jsxs("label", { children: [_jsx("strong", { children: metaInfo.label || metaInfo.fieldName || node.name }), !!metaInfo.required && " *"] }), _jsx(Editor, { name: metaInfo.fieldName, editorState: editorState, onEditorStateChange: handleEditorChange, wrapperClassName: "wrapper-class", editorClassName: "editor-class", toolbarClassName: "toolbar-class", onFocus: onFocus, readOnly: !props.enabled, toolbar: {
                    inline: { inDropdown: true },
                    image: {
                        uploadCallback: uploadImageCallBack,
                        alt: {
                            present: true,
                            mandatory: false
                        }
                    }
                } }), !!metaInfo.hasPreview && _jsx("div", { className: "preview", dangerouslySetInnerHTML: createMarkup(draftToHtml(convertToRaw(editorState.getCurrentContent()))) })] });
};
//# sourceMappingURL=richtexteditor.js.map