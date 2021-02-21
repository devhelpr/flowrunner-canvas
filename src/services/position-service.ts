let positions = {} as any;

export const clearPositions = () => {
  positions = {};
};

export const getPositions = () => {
  return positions;
};

export const setPosition = (nodeName: string, position: any) => {
  positions[nodeName] = position;
};

export const getPosition = (nodeName: string) => {
  return positions[nodeName];
};
