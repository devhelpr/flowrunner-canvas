import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { FlowToCanvas } from '../../helpers/flow-to-canvas';
import { getNewNode } from '../../helpers/flow-methods';
import { EditPopup } from '../edit-popup';
import fetch from 'cross-fetch';
import { NewFlow } from '../new-flow';
import { HelpPopup } from '../help-popup';
import { ModulesPopup } from '../modules-popup';
import Navbar from 'react-bootstrap/Navbar';
import { useFlowStore } from '../../state/flow-state';
import { PopupEnum, useCanvasModeStateStore } from '../../state/canvas-mode-state';
import { useSelectedNodeStore } from '../../state/selected-node-state';
import { useLayoutStore } from '../../state/layout-state';
import { useModulesStateStore } from '../../state/modules-menu-state';
import { PositionProvider, usePositionContext } from '../contexts/position-context';
import { NamePopup } from '../popups/name-popup';
import * as uuid from 'uuid';
import { EditBundle } from '../edit-bundle';
import { getMultiSelectInfo } from '../../services/multi-select-service';
import { EditFlowName } from '../edit-flow-name';
const uuidV4 = uuid.v4;
export const Toolbar = (props) => {
    var _a, _b, _c;
    const positionContext = usePositionContext();
    const [showModulesPopup, setShowModulesPopup] = useState(false);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [showEditBundle, setShowEditBundle] = useState(false);
    const [showSchemaPopup, setShowSchemaPopup] = useState(false);
    const [showNewFlow, setShowNewFlow] = useState(false);
    const [editFlowName, setEditFlowName] = useState(false);
    const [selectedTask, setSelectedTask] = useState('');
    const [showDependencies, setShowDependencies] = useState(false);
    const [flowFiles, setFlowFiles] = useState([]);
    const [selectedFlow, setSelectedFlow] = useState('');
    const [showTaskHelp, setShowTaskHelp] = useState(false);
    const [snapToGrid, setSnapToGrid] = useState(false);
    const flow = useFlowStore();
    const canvasMode = useCanvasModeStateStore();
    const selectedNode = useSelectedNodeStore();
    const layout = useLayoutStore();
    const modulesMenu = useModulesStateStore();
    useEffect(() => {
        props.getFlows();
    }, []);
    useEffect(() => {
        console.log('TOOLBAR useffect1');
        canvasMode.setSelectedTask('');
        setFlows(props.flows, selectedFlow || props.flowId);
    }, [props.flow, props.flowId, canvasMode.flowsUpdateId]);
    useEffect(() => {
        if (modulesMenu.selectedModule == 'tests') {
            setShowModulesPopup(true);
        }
        else if (modulesMenu.selectedModule != '') {
            setShowModulesPopup(true);
        }
        else {
            setShowModulesPopup(false);
        }
    }, [modulesMenu.selectedModule]);
    const setFlows = (flows, id) => {
        var _a;
        if (flows && flows.length > 0) {
            const flowId = id === undefined ? flows[0].id : id;
            canvasMode.setFlowsPlayground(flows
                .filter(flow => {
                return flow.flowType == 'playground';
            })
                .map(flow => {
                return {
                    label: flow.name,
                    value: flow.id,
                };
            }));
            canvasMode.setFlowsWasm(flows
                .filter(flow => {
                return flow.flowType == 'rustflowrunner';
            })
                .map(flow => {
                return {
                    label: flow.name,
                    value: flow.id,
                };
            }));
            if (props.flowrunnerConnector.hasStorageProvider) {
                (_a = props.flowrunnerConnector.storageProvider) === null || _a === void 0 ? void 0 : _a.setSelectedFlow(flowId);
            }
            setFlowFiles(flows);
            setSelectedFlow(flowId);
        }
    };
    const addNewFlow = event => {
        event.preventDefault();
        setShowNewFlow(true);
        return false;
    };
    const openEditFlowNamePopup = event => {
        event.preventDefault();
        setEditFlowName(true);
        return false;
    };
    const onSavePresetName = name => {
        if (canvasMode.onPresetName) {
            canvasMode.onPresetName(name);
        }
        canvasMode.setCurrentPopup(PopupEnum.none, undefined);
        return false;
    };
    const onCloseNamePopup = () => {
        canvasMode.setCurrentPopup(PopupEnum.none, undefined);
        return false;
    };
    const addNode = event => {
        event.preventDefault();
        if (!canvasMode.isConnectingNodes) {
            let newNode = getNewNode({
                name: selectedTask,
                id: selectedTask,
                taskType: selectedTask || 'TraceConsoleTask',
                shapeType: selectedTask == 'IfConditionTask' ? 'Diamond' : 'Circle',
                x: 50,
                y: 50,
            }, flow.flow);
            flow.addFlowNode(newNode);
        }
        return false;
    };
    const editNode = event => {
        event.preventDefault();
        if (!canvasMode.isConnectingNodes) {
            setShowEditPopup(true);
            setShowSchemaPopup(false);
        }
        return false;
    };
    const editBundle = event => {
        event.preventDefault();
        if (!canvasMode.isConnectingNodes) {
            setShowEditBundle(true);
        }
        return false;
    };
    const connectNode = event => {
        event.preventDefault();
        if (!showEditPopup) {
            canvasMode.setConnectiongNodeCanvasMode(true);
        }
        return false;
    };
    const deleteLine = event => {
        event.preventDefault();
        flow.deleteConnection(selectedNode.node);
        selectedNode.selectNode('', undefined);
        return false;
    };
    const deleteNode = event => {
        event.preventDefault();
        flow.deleteNode(selectedNode.node, !!event.shiftKey);
        selectedNode.selectNode('', undefined);
        return false;
    };
    const markAsUnHappyFlow = event => {
        event.preventDefault();
        flow.storeFlowNode({
            ...selectedNode.node.node,
            followflow: 'onfailure',
        }, selectedNode.node.name, positionContext.context);
        return false;
    };
    const markAsHappyFlow = event => {
        event.preventDefault();
        flow.storeFlowNode({
            ...selectedNode.node.node,
            followflow: 'onsuccess',
        }, selectedNode.node.name, positionContext.context);
        return false;
    };
    const getSelectedNodes = () => {
        let inputConnections = [];
        let outputConnections = [];
        let orgNodes = [];
        let repoFlow = [];
        let renameIdMap = {};
        let idCounter = 1;
        let xmin = 99999999;
        let ymin = 99999999;
        canvasMode.selectedNodes.forEach(nodeName => {
            flow.flow.forEach(node => {
                if (node.shapeType !== 'Line' && node.name === nodeName) {
                    renameIdMap[nodeName] = 'node' + idCounter;
                    idCounter++;
                    repoFlow.push({ ...node, id: renameIdMap[nodeName], name: renameIdMap[nodeName] });
                    orgNodes.push(node);
                    const position = positionContext.getPosition(node.name) || {
                        x: node.x,
                        y: node.y,
                    };
                    if (position) {
                        if (position.x < xmin) {
                            xmin = position.x;
                        }
                        if (node.y < ymin) {
                            ymin = position.y;
                        }
                    }
                }
            });
        });
        flow.flow.forEach(node => {
            if (node.shapeType === 'Line' && !renameIdMap[node.startshapeid] && renameIdMap[node.endshapeid]) {
                node.endshapeid = renameIdMap[node.endshapeid];
                inputConnections.push(node);
            }
            else if (node.shapeType === 'Line' && renameIdMap[node.startshapeid] && !renameIdMap[node.endshapeid]) {
                node.startshapeid = renameIdMap[node.startshapeid];
                outputConnections.push(node);
            }
            else if (node.shapeType === 'Line' && renameIdMap[node.startshapeid] && renameIdMap[node.endshapeid]) {
                orgNodes.push(node);
                renameIdMap[node.name] = 'node' + idCounter;
                idCounter++;
                repoFlow.push({
                    ...node,
                    id: renameIdMap[node.name],
                    name: renameIdMap[node.name],
                    startshapeid: renameIdMap[node.startshapeid],
                    endshapeid: renameIdMap[node.endshapeid],
                });
            }
        });
        let centerX = 0;
        let centerY = 0;
        let positionsAdded = 0;
        repoFlow.forEach(node => {
            if (node.shapeType !== 'Line') {
                const position = positionContext.getPosition(node.name) || {
                    x: node.x,
                    y: node.y,
                };
                centerX += position.x;
                centerY += position.y;
                positionsAdded++;
            }
        });
        if (positionsAdded > 0) {
            centerX /= positionsAdded;
            centerY /= positionsAdded;
        }
        return {
            inputConnections,
            outputConnections,
            orgNodes,
            center: {
                x: centerX,
                y: centerY,
            },
            flow: repoFlow.map(node => {
                if (node.shapeType === 'Line') {
                    const position = positionContext.getPosition(node.name) || {
                        xstart: node.xstart,
                        ystart: node.ystart,
                        xend: node.xend,
                        yend: node.yend,
                    };
                    return {
                        ...node,
                        xstart: position.xstart - xmin,
                        ystart: position.ystart - ymin,
                        xend: position.xend - xmin,
                        yend: position.yend - ymin,
                    };
                }
                else {
                    const position = positionContext.getPosition(node.name) || {
                        x: node.x,
                        y: node.y,
                    };
                    return { ...node, x: position.x - xmin, y: position.y - ymin };
                }
            }),
        };
    };
    const addToRepository = event => {
        event.preventDefault();
        console.log('addToRepository', canvasMode.selectedNodes, flow.flow);
        if (flow.flow && canvasMode.isInMultiSelect && canvasMode.selectedNodes.length > 0) {
            const repoFlowInfo = getSelectedNodes();
            console.log('repoFlow', repoFlowInfo);
            if (repoFlowInfo.flow.length > 0) {
                const unique = new Date().getTime();
                fetch('/api/modulecontent?moduleId=repository', {
                    method: 'POST',
                    body: JSON.stringify({
                        data: {
                            name: 'repo' + unique,
                            title: 'repo' + unique,
                            flow: JSON.stringify(repoFlowInfo.flow),
                        },
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
                    .then(res => {
                    if (res.status >= 400) {
                        throw new Error('Bad response from server');
                    }
                    return true;
                })
                    .catch(err => {
                    console.error(err);
                });
            }
        }
        return false;
    };
    const bundleNode = event => {
        event.preventDefault();
        if (flow.flow && canvasMode.isInMultiSelect && canvasMode.selectedNodes.length > 0) {
            const bundledNodesInfo = getSelectedNodes();
            if (bundledNodesInfo.flow.length > 0) {
                let allowBundling = true;
                bundledNodesInfo.flow.forEach(node => {
                    if (node.taskType === 'BundleFlowTask') {
                        allowBundling = false;
                    }
                });
                if (!allowBundling) {
                    alert('Nested Bundles are not allowed');
                    return;
                }
                flow.deleteNodes(bundledNodesInfo.orgNodes);
                const newNodeId = 'bundle_' + uuidV4();
                let startNodeName = '';
                let startNode = undefined;
                if (bundledNodesInfo.inputConnections.length > 0) {
                    startNodeName = bundledNodesInfo.inputConnections[0].endshapeid;
                }
                else {
                    const connections = [];
                    bundledNodesInfo.flow.forEach(node => {
                        if (node.shapeType === 'Line') {
                            connections.push(node);
                        }
                    });
                    bundledNodesInfo.flow.forEach(node => {
                        if (node.shapeType !== 'Line') {
                            let hasInputNode = false;
                            connections.forEach(connection => {
                                if (connection.endshapeid === node.name) {
                                    hasInputNode = true;
                                }
                            });
                            if (!hasInputNode && !startNode) {
                                startNode = node;
                            }
                        }
                    });
                    if (startNode) {
                        startNodeName = startNode.name;
                    }
                }
                let newNode = getNewNode({
                    name: newNodeId,
                    id: newNodeId,
                    label: 'Bundled Flow',
                    taskType: 'BundleFlowTask',
                    shapeType: 'Circle',
                    x: bundledNodesInfo.center.x || bundledNodesInfo.flow[0].x || bundledNodesInfo.flow[0].xstart,
                    y: (bundledNodesInfo.center.y || bundledNodesInfo.flow[0].y || bundledNodesInfo.flow[0].ystart) - 50,
                    flow: JSON.stringify(bundledNodesInfo.flow),
                    startNode: startNodeName,
                }, flow.flow, true);
                flow.addFlowNode(newNode);
                console.log('newNode', newNodeId, newNode);
                positionContext.setPosition(newNode.name, {
                    x: newNode.x,
                    y: newNode.y,
                });
                const storeNodes = [];
                if (bundledNodesInfo.inputConnections.length > 0) {
                    bundledNodesInfo.inputConnections[0].endshapeid = newNodeId;
                    let newEndPosition = FlowToCanvas.getEndPointForLine(newNode, {
                        x: newNode.x,
                        y: newNode.y,
                    }, undefined, undefined, props.getNodeInstance, bundledNodesInfo.inputConnections[0].thumbPosition);
                    bundledNodesInfo.inputConnections[0].xend = newEndPosition.x;
                    bundledNodesInfo.inputConnections[0].yend = newEndPosition.y;
                    positionContext.setPosition(bundledNodesInfo.inputConnections[0].name, {
                        xstart: bundledNodesInfo.inputConnections[0].xstart,
                        ystart: bundledNodesInfo.inputConnections[0].ystart,
                        xend: newEndPosition.x,
                        yend: newEndPosition.y,
                    });
                    storeNodes.push(bundledNodesInfo.inputConnections[0]);
                }
                if (bundledNodesInfo.outputConnections.length > 0) {
                    bundledNodesInfo.outputConnections.forEach(outputConnection => {
                        outputConnection.startshapeid = newNodeId;
                        let newStartPosition = FlowToCanvas.getStartPointForLine(newNode, {
                            x: newNode.x,
                            y: newNode.y,
                        }, undefined, undefined, outputConnection, props.getNodeInstance, outputConnection.thumbPosition);
                        outputConnection.xstart = newStartPosition.x;
                        outputConnection.ystart = newStartPosition.y;
                        positionContext.setPosition(outputConnection.name, {
                            xstart: newStartPosition.x,
                            ystart: newStartPosition.y,
                            xend: outputConnection.xend,
                            yend: outputConnection.yend,
                        });
                        storeNodes.push(outputConnection);
                    });
                }
                flow.storeFlowNodes(storeNodes, positionContext.context);
                if (props.canvasToolbarsubject) {
                    props.canvasToolbarsubject.next('resetMultiSelect');
                }
            }
        }
        return false;
    };
    const createSection = event => {
        event.preventDefault();
        const info = getMultiSelectInfo();
        const newNodeId = 'section_' + uuidV4();
        let newNode = getNewNode({
            name: newNodeId,
            id: newNodeId,
            label: 'Section',
            taskType: 'Annotation',
            shapeType: 'Section',
            isAnnotation: true,
            x: info.x,
            y: info.y,
            width: info.width,
            height: info.height,
            nodes: [...canvasMode.selectedNodes],
        }, flow.flow, true);
        flow.addFlowNode(newNode);
        positionContext.setPosition(newNode.name, {
            x: newNode.x,
            y: newNode.y,
        });
        if (props.canvasToolbarsubject) {
            props.canvasToolbarsubject.next('resetMultiSelect');
        }
        return false;
    };
    const createStateMachine = event => {
        event.preventDefault();
        const info = getMultiSelectInfo();
        const nodesToSelect = [];
        console.log("createStateMachine", canvasMode.selectedNodes);
        canvasMode.selectedNodes.forEach((nodeName) => {
            const nodeIndex = flow.flowHashmap.get(nodeName);
            console.log("createStateMachine nodeName", nodeName, nodeIndex);
            if (nodeIndex && nodeIndex.index >= 0) {
                const flowNode = flow.flow[nodeIndex.index];
                console.log("createStateMachine flowNode", flowNode.taskType);
                if (["State", "Action", "StartState"].indexOf(flowNode.taskType) >= 0) {
                    nodesToSelect.push(nodeName);
                }
            }
        });
        const newNodeId = 'section_' + uuidV4();
        let newNode = getNewNode({
            name: newNodeId,
            id: newNodeId,
            label: 'Section',
            taskType: 'Annotation',
            shapeType: 'Section',
            isAnnotation: true,
            isStateMachine: true,
            x: info.x,
            y: info.y,
            width: info.width,
            height: info.height,
            nodes: [...nodesToSelect],
        }, flow.flow, true);
        flow.addFlowNode(newNode);
        positionContext.setPosition(newNode.name, {
            x: newNode.x,
            y: newNode.y,
        });
        if (props.canvasToolbarsubject) {
            props.canvasToolbarsubject.next('resetMultiSelect');
        }
        return false;
    };
    const saveFlow = event => {
        event.preventDefault();
        props.saveFlow(selectedFlow);
        return false;
    };
    const onClose = (pushFlow) => {
        setShowEditBundle(false);
        setShowEditPopup(false);
        setShowSchemaPopup(false);
        setShowNewFlow(false);
        setShowModulesPopup(false);
        setEditFlowName(false);
        if (!!pushFlow) {
            canvasMode.setFlowrunnerPaused(false);
            props.flowrunnerConnector.pushFlowToFlowrunner(flow.flow, true, flow.flowId);
        }
    };
    const onCloseFlowName = () => {
        setEditFlowName(false);
    };
    const onSaveFlowName = (flowId, flowName) => {
        let flows = (props.flows || []).map(flow => {
            if (flow.id === flowId) {
                return {
                    name: flowName,
                    id: flowId,
                };
            }
            return {
                name: flow.name,
                id: flow.id,
            };
        });
        setFlowFiles(flows);
        setEditFlowName(false);
    };
    const onCloseModulesPopup = () => {
        modulesMenu.showModule('');
        modulesMenu.setOpen(false);
        setShowEditPopup(false);
        setShowSchemaPopup(false);
        setShowNewFlow(false);
        setShowModulesPopup(false);
    };
    const onCloseNewFlowPopup = (id, flowType) => {
        canvasMode.setFlowType(flowType || 'playground');
        props.flowrunnerConnector.setFlowType(flowType);
        setShowEditPopup(false);
        setShowSchemaPopup(false);
        setShowNewFlow(false);
        setShowModulesPopup(false);
        props.onGetFlows(id);
        setSelectedFlow(id);
    };
    const onSelectTask = taskClassName => {
        setSelectedTask(taskClassName);
        canvasMode.setSelectedTask(taskClassName);
    };
    const showSchema = event => {
        event.preventDefault();
        if (!canvasMode.isConnectingNodes) {
            setShowEditPopup(false);
            setShowSchemaPopup(true);
        }
        return false;
    };
    const onShowDependenciesChange = event => {
        canvasMode.setShowDependencies(!showDependencies);
        setShowDependencies(!showDependencies);
    };
    const onSnapToGridChange = event => {
        canvasMode.setSnapToGrid(!snapToGrid);
        setSnapToGrid(!snapToGrid);
    };
    const loadFlow = (flowId, withoutRefit) => {
        canvasMode.setFlowrunnerPaused(false);
        canvasMode.setFlowType(props.flowType || 'playground');
    };
    const setSelectedFlowChange = event => {
        console.log('FLOW selected', event.target.value, performance.now());
        positionContext.clearPositions();
        props.flowrunnerConnector.killAndRecreateWorker();
        setSelectedFlow(event.target.value);
        if (props.flowrunnerConnector.hasStorageProvider && props.flowrunnerConnector.storageProvider) {
            props.flowrunnerConnector.storageProvider.setSelectedFlow(event.target.value);
        }
        props.loadFlow(event.target.value);
    };
    const onSetPausedClick = event => {
        event.preventDefault();
        if (canvasMode.isFlowrunnerPaused) {
            props.flowrunnerConnector.resumeFlowrunner();
        }
        else {
            props.flowrunnerConnector.pauseFlowrunner();
        }
        canvasMode.setFlowrunnerPaused(!canvasMode.isFlowrunnerPaused);
        return false;
    };
    const exportFlowToPng = event => {
        event.preventDefault();
        if (props.canvasToolbarsubject) {
            props.canvasToolbarsubject.next('export');
        }
        return false;
    };
    const fitStage = event => {
        event.preventDefault();
        if (props.canvasToolbarsubject) {
            props.canvasToolbarsubject.next('fitStage');
        }
        return false;
    };
    const helpNode = event => {
        event.preventDefault();
        setShowTaskHelp(true);
        return false;
    };
    const swithToUIViewEditor = event => {
        event.preventDefault();
        if (props.onEditorMode) {
            canvasMode.setEditorMode('uiview-editor');
            props.onEditorMode('uiview-editor');
        }
        return false;
    };
    const swithToCanvasEditor = event => {
        event.preventDefault();
        if (props.onEditorMode) {
            canvasMode.setEditorMode('canvas');
            props.onEditorMode('canvas');
            setTimeout(() => {
                if (props.canvasToolbarsubject) {
                    props.canvasToolbarsubject.next('fitStage');
                }
            }, 50);
        }
        return false;
    };
    const showModules = event => {
        event.preventDefault();
        modulesMenu.setOpen(!modulesMenu.isOpen);
        return false;
    };
    let shapeType = '';
    if (selectedNode && selectedNode.node) {
        shapeType = FlowToCanvas.getShapeType(selectedNode.node.shapeType, selectedNode.node.taskType, selectedNode.node.isStartEnd);
    }
    let isFlowEditorOnly = false;
    if (props.isFlowEditorOnly !== undefined && !!props.isFlowEditorOnly) {
        isFlowEditorOnly = true;
    }
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "bg-dark toolbar__root", role: "menu", children: _jsx("div", { className: "toolbar__container", children: _jsx(Navbar, { bg: "dark", expand: "lg", children: _jsx("div", { className: "bg-dark toolbar w-100", children: _jsx(Navbar.Collapse, { id: "basic-navbar-nav", children: _jsxs("form", { className: "form-inline toolbar__form flex-nowrap ps-2 pe-2", children: [!isFlowEditorOnly && canvasMode.editorMode === 'canvas' && (_jsx("div", { className: "me-2", children: _jsx("a", { href: "#", onClick: showModules, className: "btn btn-outline-light ms-2", children: _jsx("span", { className: "fas fa-bars" }) }) })), _jsxs(_Fragment, { children: [(!isFlowEditorOnly ||
                                                    (props.flowrunnerConnector.hasStorageProvider &&
                                                        ((_a = props.flowrunnerConnector.storageProvider) === null || _a === void 0 ? void 0 : _a.canStoreMultipleFlows))) && (_jsxs("select", { className: "form-control form-select me-2", disabled: canvasMode.editorMode !== 'canvas', value: selectedFlow, onChange: setSelectedFlowChange, children: [_jsx("option", { value: "", disabled: true, children: "Choose flow" }), flowFiles.map((flow, index) => {
                                                            return (_jsx("option", { value: flow.id, children: flow.name }, index));
                                                        })] })), props.flowrunnerConnector.hasStorageProvider &&
                                                    ((_b = props.flowrunnerConnector.storageProvider) === null || _b === void 0 ? void 0 : _b.canStoreMultipleFlows) && (_jsx("a", { href: "#", onClick: openEditFlowNamePopup, className: 'ms-1 text-light text-decoration-none ' +
                                                        (!!selectedNode.node.name || canvasMode.editorMode !== 'canvas' ? 'disabled' : ''), title: "Edit flow name", children: _jsx("span", { className: "fas fa-edit" }) })), (!props.flowrunnerConnector.hasStorageProvider ||
                                                    (props.flowrunnerConnector.hasStorageProvider &&
                                                        ((_c = props.flowrunnerConnector.storageProvider) === null || _c === void 0 ? void 0 : _c.canStoreMultipleFlows))) && (_jsx("a", { href: "#", onClick: addNewFlow, className: 'btn btn-link me-4 text-light text-decoration-none ' +
                                                        (!!selectedNode.node.name || canvasMode.editorMode !== 'canvas' ? 'disabled' : ''), title: "Add new flow", children: _jsx("span", { children: "New" }) }))] }), !isFlowEditorOnly && canvasMode.flowType === 'playground' && canvasMode.editorMode === 'canvas' && (_jsx("img", { title: "playground", width: "32px", style: { marginLeft: -10, marginRight: 10 }, src: "/svg/game-board-light.svg" })), !isFlowEditorOnly &&
                                            canvasMode.flowType === 'rustflowrunner' &&
                                            canvasMode.editorMode === 'canvas' && (_jsx("img", { title: "rust/webassembly flow", width: "32px", style: { marginLeft: -10, marginRight: 10 }, src: "/svg/webassembly.svg" })), !isFlowEditorOnly && canvasMode.flowType === 'backend' && canvasMode.editorMode === 'canvas' && (_jsx("img", { title: "backend flow", width: "32px", style: { marginLeft: -10, marginRight: 10 }, src: "/svg/server-solid.svg" })), canvasMode.isInMultiSelect && props.hasCustomNodesAndRepository && (_jsx("a", { href: "#", onClick: addToRepository, className: "mx-2 btn btn-outline-light", title: "Add to repository", children: _jsx("span", { className: "fas fa-plus-square" }) })), canvasMode.isInMultiSelect && (_jsx("a", { href: "#", onClick: bundleNode, className: "mx-2 btn btn-outline-light", title: "Bundle nodes", children: _jsx("span", { className: "fas fa-folder-plus" }) })), canvasMode.isInMultiSelect && (_jsx("a", { href: "#", onClick: createSection, className: "mx-2 btn btn-outline-light", title: "Create section", children: _jsx("span", { className: "fas fa-object-group" }) })), canvasMode.isInMultiSelect && (_jsx("a", { href: "#", onClick: createStateMachine, className: "mx-2 btn btn-outline-light", title: "Create State Machine", children: _jsx("span", { className: "fas fa-box" }) })), !canvasMode.isInMultiSelect &&
                                            !!selectedNode.node.name &&
                                            selectedNode.node.node &&
                                            selectedNode.node.node.taskType === 'BundleFlowTask' && (_jsx("a", { href: "#", onClick: editBundle, className: "mx-2 btn btn-outline-light", children: "Edit Bundle" })), !canvasMode.isInMultiSelect && canvasMode.editorMode === 'canvas' && (_jsxs(_Fragment, { children: [_jsx("input", { id: "snapToGrid", type: "checkbox", className: "ms-2", checked: snapToGrid, onChange: onSnapToGridChange }), _jsx("label", { className: "text-white me-2", htmlFor: "snapToGrid", children: "\u00A0Snap to grid" })] })), !canvasMode.isInMultiSelect &&
                                            (props.hasShowDependenciesInMenu === undefined || props.hasShowDependenciesInMenu === true) &&
                                            !!!selectedNode.node.name &&
                                            canvasMode.editorMode === 'canvas' && (_jsxs(_Fragment, { children: [_jsx("input", { id: "showDependenciesInput", type: "checkbox", checked: showDependencies, onChange: onShowDependenciesChange }), _jsx("label", { className: "text-white", htmlFor: "showDependenciesInput", children: "\u00A0Show dependencies" })] })), ((!!selectedNode.node.name &&
                                            selectedNode.node.node &&
                                            selectedNode.node.node.taskType === 'Annotation' &&
                                            selectedNode.node.node.shapeType === 'Text') ||
                                            (!!props.hasJSONEditInMenu &&
                                                !!selectedNode.node.name &&
                                                selectedNode.node.node &&
                                                selectedNode.node.node.shapeType !== 'Line')) && (_jsx("a", { href: "#", onClick: editNode, className: "mx-2 btn btn-outline-light", children: "Edit" })), !!props.hasJSONEditInMenu &&
                                            !!selectedNode.node.name &&
                                            selectedNode.node.node &&
                                            selectedNode.node.node.shapeType === 'Line' && (_jsx("a", { href: "#", onClick: editNode, className: "mx-2 btn btn-outline-light", children: "Edit connection" })), false &&
                                            !!selectedNode.node.name &&
                                            selectedNode.node.node &&
                                            selectedNode.node.node.shapeType !== 'Line' && (_jsx("a", { href: "#", onClick: connectNode, className: 'mx-2 btn ' + (canvasMode.isConnectingNodes ? 'btn-light' : 'btn-outline-light'), children: "Connect" })), !!selectedNode.node.name && selectedNode.node.node && selectedNode.node.node.shapeType === 'Line' && (_jsx("a", { href: "#", onClick: deleteLine, className: 'mx-2 btn btn-danger', children: "Delete" })), false &&
                                            !isFlowEditorOnly &&
                                            !!selectedNode.node.name &&
                                            selectedNode.node.node &&
                                            selectedNode.node.node.shapeType !== 'Line' && (_jsx("a", { href: "#", onClick: helpNode, className: "mx-2 btn btn-outline-light", children: "Help" })), !!selectedNode.node.name &&
                                            selectedNode.node.node &&
                                            selectedNode.node.node.shapeType === 'Line' &&
                                            selectedNode.node.followflow !== 'onfailure' && (_jsx("a", { href: "#", onClick: markAsUnHappyFlow, className: 'mx-2 btn btn-outline-danger', children: "Mark as unhappy flow" })), !!selectedNode.node.name &&
                                            selectedNode.node.node &&
                                            selectedNode.node.node.shapeType === 'Line' &&
                                            selectedNode.node.followflow !== 'onsuccess' && (_jsx("a", { href: "#", onClick: markAsHappyFlow, className: 'mx-2 btn btn-outline-success', children: "Mark as happy flow" })), (canvasMode.isInMultiSelect ||
                                            (!!selectedNode.node.name &&
                                                selectedNode.node.node &&
                                                selectedNode.node.node.shapeType !== 'Line')) && (_jsx("a", { href: "#", onClick: deleteNode, className: 'mx-2 btn btn-danger', children: "Delete" })), !isFlowEditorOnly &&
                                            !!selectedNode.node.name &&
                                            selectedNode.node.node &&
                                            selectedNode.node.node.shapeType !== 'Line' && (_jsx("a", { href: "#", onClick: showSchema, className: 'mx-2 btn btn-info', children: "Show Schema" })), !isFlowEditorOnly &&
                                            !!props.hasRunningFlowRunner &&
                                            canvasMode.editorMode === 'canvas' &&
                                            canvasMode.flowType == 'playground' && (_jsx("a", { href: "#", onClick: onSetPausedClick, className: "ms-2 text-white pause-button", children: !!canvasMode.isFlowrunnerPaused ? 'paused' : 'pause' })), canvasMode.editorMode === 'canvas' && (_jsx("a", { href: "#", onClick: fitStage, className: "ms-2 btn btn-outline-light", children: "Fit stage" })), !isFlowEditorOnly && !props.flowrunnerConnector.hasStorageProvider && (_jsx("a", { href: "#", onClick: saveFlow, className: "ms-2 btn btn-primary", children: "Save" })), !isFlowEditorOnly && _jsx("span", { className: "ms-auto" }), !isFlowEditorOnly && canvasMode.flowType == 'playground' && (_jsx("a", { href: '/ui/' + selectedFlow, className: "ms-2 text-white", children: "UI View" })), !isFlowEditorOnly &&
                                            !!!selectedNode.node.name &&
                                            canvasMode.flowType == 'playground' &&
                                            canvasMode.editorMode == 'canvas' && (_jsx("a", { href: "#", onClick: swithToUIViewEditor, className: "ms-2 text-white", children: "Edit UI View" })), !isFlowEditorOnly && canvasMode.flowType == 'playground' && canvasMode.editorMode != 'canvas' && (_jsx("a", { href: "#", onClick: swithToCanvasEditor, className: "ms-2 text-white", children: "Edit Flow" })), _jsx(_Fragment, { children: props.renderMenuOptions && _jsx("span", { className: "ms-auto", children: props.renderMenuOptions() }) })] }) }) }) }) }) }), showEditBundle && (_jsx(PositionProvider, { children: _jsx(EditBundle, { hasTaskNameAsNodeTitle: props.hasTaskNameAsNodeTitle, renderHtmlNode: props.renderHtmlNode, getNodeInstance: props.getNodeInstance, flowrunnerConnector: props.flowrunnerConnector, onClose: onClose, modalSize: props.modalSize }) })), showEditPopup && _jsx(EditPopup, { flowrunnerConnector: props.flowrunnerConnector, onClose: onClose }), showNewFlow && (_jsx(NewFlow, { flowrunnerConnector: props.flowrunnerConnector, onClose: onClose, onSave: onCloseNewFlowPopup })), editFlowName && (_jsx(EditFlowName, { flowrunnerConnector: props.flowrunnerConnector, onClose: onCloseFlowName, onSaveFlowName: onSaveFlowName })), showTaskHelp && (_jsx(HelpPopup, { taskName: selectedNode && selectedNode.node ? selectedNode.node.taskType : '' })), showModulesPopup && (_jsx(ModulesPopup, { flowrunnerConnector: props.flowrunnerConnector, onClose: onCloseModulesPopup })), canvasMode.currentPopup == PopupEnum.editNamePopup && (_jsx(NamePopup, { nameCaption: "Preset name", onSave: onSavePresetName, onClose: onCloseNamePopup }))] }));
};
export * from './floating-toolbar';
//# sourceMappingURL=index.js.map