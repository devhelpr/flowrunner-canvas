import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { DndContext, closestCorners, KeyboardSensor, TouchSensor, MouseSensor, useSensor, useSensors, DragOverlay, LayoutMeasuringStrategy, defaultDropAnimation, } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSwappingStrategy } from '@dnd-kit/sortable';
import { useFormControlFromCode } from './use-form-control';
import { FormNodeHtmlPlugin } from '../form-node';
import { onFocus } from './helpers/focus';
import { SortableItem } from './helpers/sortable-context';
import { Item } from './helpers/item';
import * as uuid from 'uuid';
const uuidV4 = uuid.v4;
function forceIdsOnItems(list, metaInfo) {
    if (list) {
        return list.map((valueItem) => {
            if (metaInfo.idProperty && !valueItem[metaInfo.idProperty]) {
                valueItem[metaInfo.idProperty] = uuidV4();
            }
            return valueItem;
        });
    }
    return [];
}
export const ObjectList = (props) => {
    const { metaInfo, node } = props;
    const [activeId, setActiveId] = useState("");
    const [isAdding, setAdding] = useState(false);
    const [newValue, setNewValue] = useState({});
    const [editIndex, setEditIndex] = useState(-1);
    let formControl = useFormControlFromCode(forceIdsOnItems(props.value || [], metaInfo), metaInfo, props.onChange);
    const defaultDropAnimationConfig = {
        ...defaultDropAnimation,
        dragSourceOpacity: 0.5,
    };
    const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor), useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
    }));
    useEffect(() => {
        formControl.setValue(props.value);
    }, [props.value]);
    const deleteClick = (event, index) => {
        event.preventDefault();
        event.stopPropagation();
        setAdding(false);
        let newList = [...formControl.value];
        newList.splice(index, 1);
        formControl.handleChangeByValue(newList);
        return false;
    };
    const addItem = (event) => {
        event.preventDefault();
        let newList = [...formControl.value];
        if (props.fieldDefinition && props.fieldDefinition.idProperty &&
            !newValue[props.fieldDefinition.idProperty]) {
            newValue[props.fieldDefinition.idProperty] = uuidV4();
        }
        newList.push(newValue);
        formControl.handleChangeByValue(newList);
        return false;
    };
    const onAppendValue = (event) => {
        event.preventDefault();
        let newList = [...formControl.value];
        if (props.fieldDefinition && props.fieldDefinition.idProperty &&
            !newValue[props.fieldDefinition.idProperty]) {
            newValue[props.fieldDefinition.idProperty] = uuidV4();
        }
        newList.push(newValue);
        formControl.handleChangeByValue(newList);
        setAdding(false);
        setNewValue({});
        return false;
    };
    const onEditNodeKeyValue = (index, value, fieldName) => {
        const clonedValue = { ...formControl.value[index] };
        clonedValue[fieldName] = value;
        let newList = [...formControl.value];
        newList[index] = clonedValue;
        formControl.handleChangeByValue(newList);
    };
    const onAddNodeKeyValue = (value, fieldName) => {
        const clonedValue = { ...newValue };
        clonedValue[fieldName] = value;
        setNewValue(clonedValue);
    };
    const onCloseAppendValue = (event) => {
        event.preventDefault();
        setAdding(false);
        return false;
    };
    const onEditItem = (index, event) => {
        event.preventDefault();
        event.stopPropagation();
        setEditIndex(index);
        return false;
    };
    function handleDragStart(event) {
        const { active } = event;
        setActiveId(active.id);
        console.log("handleDragStart", active.id, props, formControl.value);
    }
    function handleDragOver(event) {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            if (props.fieldDefinition && props.fieldDefinition.idProperty) {
                let newList = [...formControl.value];
                let index = -1;
                let overIndex = -1;
                newList.map((item, currentIndex) => {
                    if (item[props.fieldDefinition.idProperty] == active.id) {
                        index = currentIndex;
                    }
                    if (item[props.fieldDefinition.idProperty] == over.id) {
                        overIndex = currentIndex;
                    }
                });
                let oldIndex = index;
                let newIndex = overIndex;
                console.log("handleDragOver", oldIndex, newIndex);
                formControl.handleChangeByValue(arrayMove(newList, oldIndex, newIndex));
            }
            else {
                let index = parseInt(active.id);
                let overIndex = parseInt(over.id);
                let newList = [...formControl.value];
                let oldIndex = index;
                let newIndex = overIndex;
                formControl.handleChangeByValue(arrayMove(newList, oldIndex, newIndex));
            }
        }
    }
    function handleDragEnd(event) {
        const { active, over } = event;
        if (props.fieldDefinition && props.fieldDefinition.idProperty) {
            let newList = [...formControl.value];
            let index = -1;
            let overIndex = -1;
            newList.map((item, currentIndex) => {
                if (item[props.fieldDefinition.idProperty] == active.id) {
                    index = currentIndex;
                }
                if (item[props.fieldDefinition.idProperty] == over.id) {
                    overIndex = currentIndex;
                }
            });
            let oldIndex = index;
            let newIndex = overIndex;
            console.log("handleDragEnd", oldIndex, newIndex);
            formControl.handleChangeByValue(arrayMove(newList, oldIndex, newIndex));
        }
        else {
            let index = parseInt(active.id);
            let overIndex = parseInt(over.id);
            console.log("handleDragEnd", index, overIndex);
            if (index !== overIndex) {
                let newList = [...formControl.value];
                let oldIndex = index;
                let newIndex = overIndex;
                formControl.handleChangeByValue(arrayMove(newList, oldIndex, newIndex));
            }
        }
        setActiveId("");
    }
    const getValueByActiveId = (id) => {
        let value = {};
        formControl.value.map((item, index) => {
            if (props.fieldDefinition && props.fieldDefinition.idProperty) {
                if (item[props.fieldDefinition.idProperty] == id) {
                    value = item;
                }
            }
            else if (parseInt(id) == index) {
                value = item;
            }
        });
        return value;
    };
    const getSortableItems = () => {
        if (!formControl.value) {
            return [];
        }
        const result = formControl.value.map((item, index) => {
            if (props.fieldDefinition && props.fieldDefinition.idProperty) {
                return item[props.fieldDefinition.idProperty];
            }
            return index.toString();
        });
        console.log("getSortableItems", result);
        return result;
    };
    return _jsxs("div", { className: "form-group", "data-helper": "object-list", children: [_jsx("label", { children: _jsx("strong", { children: metaInfo.label || metaInfo.fieldName || node.name }) }), !!props.isInFlowEditor ? _jsx(_Fragment, { children: metaInfo.viewMode && metaInfo.viewMode == "table" && metaInfo.metaInfo ?
                    _jsx("table", { children: _jsx("tbody", { children: Array.isArray(formControl.value) && formControl.value.map((listItem, index) => {
                                let isSelected = false;
                                if (props.payload && props.node && props.payload["_" + props.node.name + "-node"] !== undefined) {
                                    if (index == props.payload["_" + props.node.name + "-node"]) {
                                        isSelected = true;
                                    }
                                }
                                if (index != editIndex) {
                                    return _jsxs("tr", { className: isSelected ? "bg-primary text-white" : "", children: [_jsx("td", { children: _jsx("a", { href: "#", onFocus: onFocus, onClick: (event) => onEditItem(index, event), className: "fas fa-edit" }) }), metaInfo.metaInfo.map((item, index) => {
                                                return _jsx("td", { className: "p-2", children: listItem[item.fieldName] }, "cell" + index);
                                            })] }, "table-row" + index);
                                }
                                else {
                                    return _jsx("tr", { children: _jsx("td", { colSpan: metaInfo.metaInfo.length + 1, children: _jsxs("div", { className: "form-control__object-list-node", children: [_jsx("a", { href: "#", onFocus: onFocus, onClick: (event) => deleteClick(event, index), className: "form-control__object-list-node-delete fas fa-trash-alt" }), _jsx(FormNodeHtmlPlugin, { node: { ...formControl.value[index], metaInfo: props.metaInfo.metaInfo, name: props.node.name + "-edit-" + index, id: props.node.name + "-edit-" + index }, isObjectListNodeEditing: true, isInFlowEditor: props.isInFlowEditor, onSetValue: (value, fieldName) => onEditNodeKeyValue(index, value, fieldName), datasources: props.datasources })] }, "input" + metaInfo.fieldName + index) }) }, "table-row" + index);
                                }
                            }) }) })
                    :
                        _jsx(_Fragment, { children: Array.isArray(formControl.value) && formControl.value.map((listItem, index) => {
                                return _jsxs("div", { className: "form-control__object-list-node", children: [_jsx("a", { href: "#", onFocus: onFocus, onClick: (event) => deleteClick(event, index), className: "form-control__object-list-node-delete fas fa-trash-alt" }), _jsx(FormNodeHtmlPlugin, { node: { ...formControl.value[index],
                                                metaInfo: props.metaInfo.metaInfo,
                                                name: props.node.name + "-edit-" + index,
                                                id: props.node.name + "-edit-" + index }, isObjectListNodeEditing: true, isInFlowEditor: props.isInFlowEditor, onSetValue: (value, fieldName) => onEditNodeKeyValue(index, value, fieldName), datasources: props.datasources, taskSettings: undefined })] }, "input" + metaInfo.fieldName + index);
                            }) }) })
                :
                    _jsx(_Fragment, { children: metaInfo.viewMode && metaInfo.viewMode == "table" && metaInfo.metaInfo ?
                            _jsx("table", { children: _jsx("tbody", { children: _jsxs(DndContext, { id: node.name + "_" + metaInfo.fieldName + "_dndcontext", layoutMeasuring: { strategy: LayoutMeasuringStrategy.Always }, sensors: sensors, collisionDetection: closestCorners, onDragStart: handleDragStart, onDragEnd: handleDragEnd, onDragCancel: handleDragEnd, onDragOver: handleDragOver, children: [_jsx(SortableContext, { items: getSortableItems(), strategy: rectSwappingStrategy, children: Array.isArray(formControl.value) && formControl.value.map((listItem, index) => {
                                                    return _jsx(SortableItem, { id: props.fieldDefinition && props.fieldDefinition.idProperty ? listItem[props.fieldDefinition.idProperty] : index.toString(), index: index, node: { ...formControl.value[index], metaInfo: props.metaInfo.metaInfo, name: props.node.name + "-edit-" + index, id: props.node.name + "-edit-" + index }, isObjectListNodeEditing: true, onSetValue: (value, fieldName) => onEditNodeKeyValue(index, value, fieldName), datasources: props.datasources, viewMode: metaInfo.viewMode, isInFlowEditor: props.isInFlowEditor, payload: props.payload, listItem: listItem, editIndex: editIndex, onEditItem: onEditItem, metaInfo: metaInfo, isBeingSorted: false, deleteClick: deleteClick, onEditNodeKeyValue: onEditNodeKeyValue }, "viewmode-table-" + index);
                                                }) }), _jsx(DragOverlay, { dropAnimation: defaultDropAnimationConfig, children: activeId != "" ? _jsx(Item, { id: activeId.toString(), style: {}, children: {}, listeners: {}, index: -1, node: { ...getValueByActiveId(activeId), metaInfo: props.metaInfo.metaInfo, name: props.node.name + "-edit-" + activeId,
                                                        id: props.node.name + "-edit-" + activeId }, isObjectListNodeEditing: true, onSetValue: (value, fieldName) => onEditNodeKeyValue(activeId, value, fieldName), datasources: props.datasources, viewMode: "table-dragging", payload: props.payload, listItem: formControl.value[activeId], isInFlowEditor: props.isInFlowEditor, editIndex: editIndex, onEditItem: onEditItem, metaInfo: metaInfo, isBeingSorted: false, deleteClick: deleteClick, onEditNodeKeyValue: onEditNodeKeyValue }) : null })] }) }) })
                            : _jsxs(DndContext, { id: node.name + "_" + metaInfo.fieldName + "_dndcontext2", sensors: sensors, collisionDetection: closestCorners, onDragStart: handleDragStart, onDragEnd: handleDragEnd, onDragCancel: handleDragEnd, onDragOver: handleDragOver, children: [_jsx(SortableContext, { items: getSortableItems(), strategy: rectSwappingStrategy, children: Array.isArray(formControl.value) && formControl.value.map((listItem, index) => {
                                            return _jsx(SortableItem, { id: props.fieldDefinition && props.fieldDefinition.idProperty ? listItem[props.fieldDefinition.idProperty] : index.toString(), index: index, node: { ...formControl.value[index], metaInfo: props.metaInfo.metaInfo, name: props.node.name + "-edit-" + index, id: props.node.name + "-edit-" + index }, isObjectListNodeEditing: true, onSetValue: (value, fieldName) => onEditNodeKeyValue(index, value, fieldName), datasources: props.datasources, viewMode: metaInfo.viewMode, payload: props.payload, listItem: listItem, isInFlowEditor: props.isInFlowEditor, editIndex: editIndex, isBeingSorted: false, onEditItem: onEditItem, metaInfo: metaInfo, deleteClick: deleteClick, onEditNodeKeyValue: onEditNodeKeyValue }, index.toString());
                                        }) }), _jsx(DragOverlay, { children: activeId != "" ? _jsx(Item, { id: activeId.toString(), style: {}, children: {}, listeners: {}, index: -1, node: { ...getValueByActiveId(activeId), metaInfo: props.metaInfo.metaInfo, name: props.node.name + "-edit-" + activeId,
                                                id: props.node.name + "-edit-" + activeId }, isObjectListNodeEditing: true, onSetValue: (value, fieldName) => onEditNodeKeyValue(activeId, value, fieldName), datasources: props.datasources, viewMode: "dragging", payload: props.payload, listItem: formControl.value[activeId], isInFlowEditor: props.isInFlowEditor, editIndex: editIndex, onEditItem: onEditItem, metaInfo: metaInfo, deleteClick: deleteClick, isBeingSorted: false, onEditNodeKeyValue: onEditNodeKeyValue }) : null })] }) }), isAdding ?
                _jsx("div", { className: "form-control__object-list-node", children: _jsx(FormNodeHtmlPlugin, { node: { ...newValue, metaInfo: props.metaInfo.metaInfo, name: props.node.name + "-add", id: props.node.name + "-add" }, isObjectListNodeEditing: true, isInFlowEditor: props.isInFlowEditor, onSetValue: onAddNodeKeyValue, datasources: props.datasources }) }) :
                _jsx("div", { children: _jsx("a", { href: "#", onFocus: onFocus, onClick: addItem, className: "fas fa-plus-circle" }) })] });
};
//# sourceMappingURL=object-list.js.map