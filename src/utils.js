export const getTimeDefinition = async (url) => {
  const definitionUrl = url + '/multiDimensionalInfo?f=json';
  const response = await fetch(definitionUrl);
  const result = await response.json();
  const data = result.multidimensionalInfo;
  return [
    {
      variableName: data.variables[0].name,
      dimensionName: data.variables[0].dimensions[0].name,
      values: data.variables[0].dimensions[0].values
    }
  ];
};

const defaultSymbol = {
  type: 'simple-fill',
  color: [0, 217, 109, 0],
  style: 'solid',
  outline: {
    width: 0.5,
    color: [255, 255, 255, 1]
  }
};

const highlightedSymbol = {
  type: 'simple-fill',
  color: [0, 0, 0],
  style: 'diagonal-cross',
  outline: {
    width: 0,
    color: [0, 0, 0]
  }
};

export const getSelectionRenderer = (field, value) => {
  return {
    type: 'unique-value',
    field,
    defaultSymbol,
    uniqueValueInfos: [
      {
        value,
        symbol: highlightedSymbol
      }
    ]
  };
};

export const getSimpleRenderer = () => {
  return {
    type: 'simple',
    symbol: defaultSymbol
  };
};

export const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];
