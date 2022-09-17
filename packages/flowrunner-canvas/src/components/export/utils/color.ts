export const getColor = (settings: any) => {
  if (settings) {
    if (settings.background === 'background-green') {
      return '#3bee76'; // 0x3bee76
    } else if (settings.background === 'background-orange') {
      return '#f8a523'; // 0xf8a523
    } else if (settings.background === 'background-blue') {
      return '#86c6f8'; // 0x86c6f8
    } else if (settings.background === 'background-purple') {
      return '#cc8aee'; // 0xcc8aee
    } else if (settings.background === 'background-dark-yellow') {
      return '#f0e938'; // 0xf0e938
    } else if (settings.background === 'background-yellow') {
      return '#fbf791'; // 0xf0e938
    } else {
      return '#ffffff';
    }
  } else {
    return '#ffffff';
  }
};
