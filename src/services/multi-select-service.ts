const selectionInfo = {
  x: 0,
  y: 0,
  width: 0,
  height: 0
}

export const setMultiSelectInfo = (x : number, y : number, width : number, height : number) => {
  selectionInfo.x = x;
  selectionInfo.y = y;
  selectionInfo.width = width;
  selectionInfo.height = height;
};

export const getMultiSelectInfo = () => {
  return selectionInfo;
};
