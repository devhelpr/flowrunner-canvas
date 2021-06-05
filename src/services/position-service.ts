let positions = new Map()

export const clearPositions = () => {
  positions = new Map();
};

export const getPositions = () => {
  return positions;
};

export const setPosition = (nodeName: string, position: any) => {
  //positions[nodeName] = position;
  positions.set(nodeName, position);
};

export const getPosition = (nodeName: string) => {
  //return positions[nodeName];
  return positions.get(nodeName);
};
