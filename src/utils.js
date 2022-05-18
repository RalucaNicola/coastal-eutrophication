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
