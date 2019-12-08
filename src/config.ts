const stateTypeTask = {
  shapeType: 'Circle',
  strokeColor: '#0080e0',
  fillColor: '#34a5fa',
  fillSelectedColor: '#065c9d',
  textColor: '#ffffff',
};

const actionTask = {
  strokeColor: '#f78306',
  fillColor: '#f7a145',
  fillSelectedColor: '#ce791f',
  textColor: '#000000',
};

export const taskTypeConfig: any = {
  AssignTask: {
    shapeType: 'Rect',
  },
  InjectIntoPayloadTask: {
    shapeType: 'Rect',
    layout : {
      strokeColor: '#d61bd8',
      fillColor: '#d550d7',
      fillSelectedColor: '#d32cd5',
      textColor: '#ffffff'
    }
  },
  ClearTask: {
    shapeType: 'Rect',
  },
  FunctionCallTask: {
    cornerRadius: 10,
  },
  FetchTask: {
    shapeType: 'Rect',
    isSkewed: true,
  },
  ExpressionTask: {
    shapeType: 'Rect',
  },
  ObservableTask: {
    strokeColor: '#510a24',
    fillColor: '#d81b60',
    fillSelectedColor: '#921241',
    textColor: '#ffffff',
  },
  ObserverTask: {
    strokeColor: '#510a24',
    fillColor: '#d81b60',
    fillSelectedColor: '#921241',
    textColor: '#ffffff',
  },
  ReduxArrayStateType: stateTypeTask,
  ReduxPropertyStateType: stateTypeTask,
  ReduxHashmapStateType: stateTypeTask,
  ReduxActionTask: actionTask,
  ReduxAssignArrayActionTask: actionTask,
  ReduxSetItemByKeyArrayActionTask: actionTask,
  ReduxClearArrayActionTask: actionTask,
  ReduxGetKeyTask: actionTask,
  ReduxGetTask: actionTask,
  ReduxPushArrayActionTask: actionTask,
};
