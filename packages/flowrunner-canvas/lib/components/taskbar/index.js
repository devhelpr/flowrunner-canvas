import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { Draggable } from './draggable';
import fetch from 'cross-fetch';
import { FlowToCanvas } from '../../helpers/flow-to-canvas';
import { useCanvasModeStateStore } from '../../state/canvas-mode-state';
import { useModulesStateStore } from '../../state/modules-menu-state';
export var TaskMenuMode;
(function (TaskMenuMode) {
    TaskMenuMode[TaskMenuMode["tasks"] = 0] = "tasks";
    TaskMenuMode[TaskMenuMode["modules"] = 1] = "modules";
})(TaskMenuMode || (TaskMenuMode = {}));
export const Taskbar = (props) => {
    const [metaDataInfo, setMetaDataInfo] = useState([]);
    const [menuMode, setMenuMode] = useState(TaskMenuMode.tasks);
    const [modules, setModules] = useState([]);
    const [repositoryItems, setRepositoryItems] = useState({});
    const [customNodes, setCustomNodes] = useState({});
    const canvasMode = useCanvasModeStateStore();
    const modulesMenu = useModulesStateStore();
    const abortableControllerRef = useRef(null);
    const setupTasks = (metaDataInfo) => {
        const taskPluginsSortedList = metaDataInfo.sort((a, b) => {
            if (a.fullName < b.fullName) {
                return -1;
            }
            if (a.fullName > b.fullName) {
                return 1;
            }
            return 0;
        });
        const tasks = taskPluginsSortedList.filter((task) => {
            return (task.flowType == canvasMode.flowType) || (task.flowType == "*");
        }).map((task) => {
            const taskSettings = FlowToCanvas.getTaskSettings(task.className);
            return { ...task,
                icon: taskSettings.icon || task.icon || ""
            };
        });
        setMetaDataInfo(tasks);
    };
    const loadTasks = () => {
        var _a;
        const { signal } = abortableControllerRef.current;
        if (props.flowrunnerConnector.hasStorageProvider) {
            let tasks = ((_a = props.flowrunnerConnector.storageProvider) === null || _a === void 0 ? void 0 : _a.getTasks()) || [];
            setupTasks([...tasks, ...props.flowrunnerConnector.getTasksFromPluginRegistry()]);
            return;
        }
        fetch('/tasks', { signal })
            .then(res => {
            if (res.status >= 400) {
                throw new Error("Bad response from server");
            }
            return res.json();
        })
            .then(metaDataInfo => {
            setupTasks([
                ...metaDataInfo,
                ...props.flowrunnerConnector.getTasksFromPluginRegistry(),
                {
                    fullName: "Text annotation",
                    className: "AnnotationText",
                    taskType: "Annotation",
                    shapeType: "Text",
                    flowType: "*",
                    title: "Text annotation",
                    isAnnotation: true,
                }
            ]);
        })
            .catch(err => {
            console.error(err);
        });
    };
    const loadModules = () => {
        const { signal } = abortableControllerRef.current;
        fetch('/api/modules', { signal })
            .then(res => {
            if (res.status >= 400) {
                throw new Error("Bad response from server");
            }
            return res.json();
        })
            .then(modules => {
            console.log("modules", modules);
            setModules(modules);
        })
            .catch(err => {
            console.error(err);
        });
    };
    const loadRepositoryItems = () => {
        const { signal } = abortableControllerRef.current;
        fetch('/api/module?codeName=repository', { signal })
            .then(res => {
            if (res.status >= 400) {
                throw new Error("Bad response from server");
            }
            return res.json();
        })
            .then(repositoryItems => {
            console.log("repositoryItems", repositoryItems);
            setRepositoryItems(repositoryItems);
        })
            .catch(err => {
            console.error(err);
        });
    };
    const loadCustomNodesItems = () => {
        const { signal } = abortableControllerRef.current;
        fetch('/api/module?codeName=customNodes', { signal })
            .then(res => {
            if (res.status >= 400) {
                throw new Error("Bad response from server");
            }
            return res.json();
        })
            .then(customNodes => {
            console.log("customNodes", customNodes);
            setCustomNodes(customNodes);
        })
            .catch(err => {
            console.error(err);
        });
    };
    useEffect(() => {
        const controller = new AbortController();
        abortableControllerRef.current = controller;
        return () => {
            controller.abort();
        };
    }, []);
    useEffect(() => {
        console.log("USEEFFECT taskbar : trigger loadTasks etc is done now");
        loadTasks();
        if (props.hasCustomNodesAndRepository) {
            loadRepositoryItems();
            loadCustomNodesItems();
        }
    }, [canvasMode, props.hasCustomNodesAndRepository]);
    useEffect(() => {
        if (modulesMenu.isOpen) {
            setMenuMode(TaskMenuMode.modules);
            loadModules();
        }
        else {
            setMenuMode(TaskMenuMode.tasks);
        }
    }, [modulesMenu.isOpen]);
    useEffect(() => {
        if (metaDataInfo.length > 0) {
            let loadingElement = document.getElementById("loading");
            if (loadingElement && !loadingElement.classList.contains("loaded")) {
                loadingElement.classList.add("loaded");
                setTimeout(() => {
                    let loadingElement = document.getElementById("loading");
                    if (loadingElement) {
                        loadingElement.classList.add("hidden");
                    }
                }, 350);
            }
        }
    }, [metaDataInfo]);
    const onShowTests = (event) => {
        event.preventDefault();
        modulesMenu.showModule("tests");
        return false;
    };
    const onShowModule = (module, event) => {
        event.preventDefault();
        modulesMenu.showModule(module.name, module.id, module.moduleType);
        return false;
    };
    const onDragStart = (event) => {
        event.dataTransfer.setData("data-task", event.target.getAttribute("data-task"));
    };
    const renderRect = (className, taskMetaData) => {
        var _a;
        let html5DragAndDrop = false;
        const shapeType = FlowToCanvas.getShapeType("Rect", className, false);
        if (shapeType == "Circle") {
            return _jsx("div", { className: "taskbar__task", title: className, "data-task": className, draggable: html5DragAndDrop, onDragStart: onDragStart, children: _jsx("div", { className: "taskbar__taskname", children: taskMetaData.title || className }) });
        }
        if (shapeType == "Ellipse") {
            return _jsx("div", { className: "taskbar__task", title: className, "data-task": className, draggable: html5DragAndDrop, onDragStart: onDragStart, children: _jsx("div", { className: "taskbar__taskname", children: className }) });
        }
        if (shapeType == "Diamond") {
            return _jsxs("div", { className: "taskbar__task", title: className, "data-task": className, draggable: html5DragAndDrop, onDragStart: onDragStart, children: [_jsx("div", { className: "taskbar__taskname", children: className }), taskMetaData.icon ? _jsx("span", { className: "taskbar__task-icon fas " + taskMetaData.icon }) :
                        _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", children: _jsx("polygon", { points: "8,2,14,8,8,14,2,8", className: "taskbar__task-circle" }) })] });
        }
        return _jsxs("div", { id: `task_${className}`, className: "taskbar__task", title: taskMetaData.title || className, "data-task": className, "data-id": (_a = taskMetaData.id) !== null && _a !== void 0 ? _a : "", draggable: html5DragAndDrop, onDragStart: onDragStart, children: [_jsx("div", { className: "taskbar__taskname", children: taskMetaData.title || className }), taskMetaData.icon && _jsx("span", { className: "taskbar__task-icon fas " + taskMetaData.icon })] });
    };
    return _jsx(_Fragment, { children: _jsx("div", { className: "taskbar", style: { pointerEvents: props.isDragging ? "none" : "auto" }, children: menuMode == TaskMenuMode.tasks ?
                _jsx("div", { className: "taskbar__ribbon", children: _jsxs(_Fragment, { children: [metaDataInfo.map((taskMetaData, index) => {
                                return _jsx(Draggable, { id: taskMetaData.className, children: renderRect(taskMetaData.className, taskMetaData) }, taskMetaData.className);
                            }), _jsxs("div", { children: [repositoryItems && repositoryItems.items && repositoryItems.items.length > 0 &&
                                        _jsx("div", { className: "p-1 tw-mt-4 tw-bg-gray-300", children: _jsx("h2", { children: "Repository" }) }), repositoryItems && repositoryItems.items && repositoryItems.items.map((repoItem, index) => {
                                        const taskRepoItem = {
                                            className: "repo-item" + index,
                                            id: repoItem.id,
                                            title: repoItem.name
                                        };
                                        return _jsx(Draggable, { id: taskRepoItem.className, children: renderRect(taskRepoItem.className, taskRepoItem) }, taskRepoItem.className);
                                    })] }), _jsxs("div", { children: [customNodes && customNodes.items && customNodes.items.length > 0 &&
                                        _jsx("div", { className: "p-1 tw-mt-4 tw-bg-gray-300", children: _jsx("h2", { children: "CustomNodes" }) }), customNodes && customNodes.items && customNodes.items.map((customNode, index) => {
                                        const taskCustomNode = {
                                            className: "custom-node" + index,
                                            id: customNode.id,
                                            title: customNode.name
                                        };
                                        return _jsx(Draggable, { id: taskCustomNode.className, children: renderRect(taskCustomNode.className, taskCustomNode) }, taskCustomNode.className);
                                    })] })] }) }) :
                _jsxs(_Fragment, { children: [modules.map((module, index) => {
                            return _jsx("button", { onClick: (event) => onShowModule(module, event), className: "btn btn-outline-primary w-100 mb-2", children: module.name }, "module-" + index);
                        }), canvasMode.flowType == "playground" && _jsx("button", { onClick: onShowTests, className: "btn btn-outline-primary w-100", children: "Tests" })] }) }) });
};
//# sourceMappingURL=index.js.map