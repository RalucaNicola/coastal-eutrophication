export const mapConfig = {
  // 'web-map-id': 'cc1b99d9557f45288e2e30ab4e1dc846', // my basemap
  'web-map-id': 'bea906821f874d24b6dcf2a794edefd9', // John's basemap
  'yearly-layer':
    'https://tiledimageservices.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/SDG_Reporting_202202_anomaly_chlor_a/ImageServer',
  'monthly-layer':
    'https://tiledimageservices.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/SDG_Reporting_202202_anomaly_monthly_frequency_v2/ImageServer'
};

export const queryLayersInfo = [
  {
    variableName: 'anomaly_chlor_a_value',
    url: 'https://tiledimageservices.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/SDG_Reporting_202202_anomaly_chlor_a/ImageServer',
    title: 'Chlorophill-a'
  },
  {
    variableName: 'p90',
    url: 'https://tiledimageservices.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/SDG_Reporting_202202_p90/ImageServer',
    title: '90th percentile'
  },
  {
    variableName: 'baseline',
    url: 'https://tiledimageservices.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/SDG_Reporting_202202_baseline/ImageServer',
    title: 'Baseline value'
  },
  {
    variableName: 'percent_difference',
    url: 'https://tiledimageservices.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/SDG_Reporting_202202_percent_difference/ImageServer',
    title: 'Percent difference'
  }
];

export const regionNames = ['country', 'level2', 'level1', 'region'];
