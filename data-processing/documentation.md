The data used for this application:

Webmap created by John Nelson (currently using [my copy of it](https://zurich.maps.arcgis.com/home/item.html?id=87885b8822704d92a962f09cb00ea259), because I added the ocean currents):

-> https://zurich.maps.arcgis.com/home/item.html?id=4ffbe9fd001f4da0b755d9eaeb2c763c

In the web application, the following services are used for display on the map:

- [Chlorophyll-a concentration anomaly](https://tiledimageservices.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/SDG_Reporting_202202_anomaly_chlor_a/ImageServer)
- [Chlorophyll anomaly monthly frequency](https://tiledimageservices.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/SDG_Reporting_202202_anomaly_monthly_frequency_v2/ImageServer)

Additionally, for the popup, we query the following services:

- [90th percentile](https://tiledimageservices.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/SDG_Reporting_202202_p90/ImageServer)
- [Baseline values](https://tiledimageservices.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/SDG_Reporting_202202_baseline/ImageServer)
- [Percent difference](https://tiledimageservices.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/SDG_Reporting_202202_percent_difference/ImageServer)

For the charts we generate [csv files](../public/data/) with data from the following table:

- [https://services.arcgis.com/bDAhvQYMG4WL8O5o/ArcGIS/rest/services/eez_v11_with_UN_code_and_EEZ_pixel_count_and_UN_regions_and_stats_UN_Country_Dissolve_v3/]

The code to generate the charts for yearly values and monthly averages can be found here in [main.py](./main.py). Additionally we generate a file that contains information about the regions that each EEZ belongs to.
