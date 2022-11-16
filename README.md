# Coastal eutrophication

The [Coastal eutrophication](https://geoxc-apps4.bd.esri.com/coastal-eutrophication/) is a work of Esri’s Living Atlas of the World. To access this data directly, visit [this ArcGIS Online resource](https://www.arcgis.com/home/group.html?id=79d07e80275f4e20965d30a2123d1701#overview).

[View it live](https://geoxc-apps4.bd.esri.com/coastal-eutrophication/)

## Instructions:

You need to have [git](https://git-scm.com/) and [npm](https://www.npmjs.com/) installed on your machine.
Clone this repository to your computer with the following command:

```sh
git clone git@github.com:RalucaNicola/coastal-eutrophication.git
```

Install the modules that are need to run the app:

```sh
npm install
```

## Running the app for development

Now you can start the vite development server to test the app on your local machine:

```sh
# it will start a server instance and begin listening for connections from localhost on port 3000
npm run dev
```

## Deployment

To build/deploy the app, you can simply run:

```sh
# it will place all files needed for deployment into the /dist directory
npm run build
```

Copy the content of the `/dist` directory to the server where you want to deploy the application.

## Requirements

- [ArcGIS API for JavaScript (version 4.25)](https://developers.arcgis.com/javascript/index.html)

## Data

- [Basemap](https://www.arcgis.com/home/item.html?id=bea906821f874d24b6dcf2a794edefd9)
- [Yearly anomaly chloropleth value](https://tiledimageservices.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/SDG_Reporting_202202_anomaly_chlor_a/ImageServer)
- [Monthly anomaly frequency](https://tiledimageservices.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/SDG_Reporting_202202_anomaly_monthly_frequency_v2/ImageServer)
- [90th percentile](https://tiledimageservices.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/SDG_Reporting_202202_p90/ImageServer)
- [Baseline values](https://tiledimageservices.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/SDG_Reporting_202202_baseline/ImageServer)
- [Percent difference](https://tiledimageservices.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/SDG_Reporting_202202_percent_difference/ImageServer)
- [EEZ polygons with statistics](https://services.arcgis.com/bDAhvQYMG4WL8O5o/ArcGIS/rest/services/eez_v11_with_UN_code_and_EEZ_pixel_count_and_UN_regions_and_stats_UN_Country_Dissolve_v3/FeatureServer/0)

## Issues

Find a bug or want to request a new feature? Please let us know by submitting an issue.

## Contributing

Esri welcomes contributions from anyone and everyone. Please see our [guidelines for contributing](https://github.com/esri/contributing).

## Licensing

Copyright 2022 Esri

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

A copy of the license is available in the repository's [license.txt](license.txt) file.
