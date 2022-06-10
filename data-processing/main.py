import requests
import csv
import datetime

base_url = "https://services.arcgis.com/bDAhvQYMG4WL8O5o/ArcGIS/rest/services/eez_v11_with_UN_code_and_EEZ_pixel_count_and_UN_regions_and_stats_UN_Country_Dissolve_v3/FeatureServer/0/query"
parameters = {
    "where": 'M49_Region',
}

def fix_region_name(name):
    if name is not None:
        return name.replace(" ", " ")
    return "no name"


def get_axes_info(features):
    values = {}
    formatted_dates = []
    countries = []
    countries_regions = {}
    for feature in features:
        date = feature["attributes"]["Date"]
        country = feature["attributes"]["CountryName"]
        impact = feature["attributes"]["Impact_Percent"]
        region = fix_region_name(feature["attributes"]["SDG_Regions"])
        region_level1 = fix_region_name(feature["attributes"]["M49_Level_1_Region"])
        region_level2 = fix_region_name(feature["attributes"]["M49_Level_2_Region"])
        if date is not None:
            formatted_date = datetime.datetime.fromtimestamp(date/1000).date()
            if formatted_date not in formatted_dates:
                formatted_dates.append(formatted_date)
            if country is not None and country not in countries:
                countries.append(country)
                values[country] = {}
                countries_regions[country] = [region, region_level1, region_level2]
            if country is not None:
                values[country][str(formatted_date)] = impact or 0
    return formatted_dates, countries, values, countries_regions


def load_data():
    totalFeatures = []
    for i in range(0, 41):
        response = requests.get(base_url + "?where=1%3D1&objectIds=&time=&resultType=none&outFields=CountryName%2C+Date%2C+Impact_Percent%2C+SDG_Regions%2C+M49_Level_1_Region%2C+M49_Level_2_Region&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=Date%2CCountryName&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=" + str(i * 1000) + "&resultRecordCount=&sqlFormat=none&f=json&token=")
        features = response.json()["features"]
        totalFeatures = totalFeatures + features
    return get_axes_info(totalFeatures)


# create total impact percentage file
def write_impact_values_file(dates, countries, values):
    header = ["date"] + countries
    f = open('impact_data_total.csv', 'w')
    writer = csv.writer(f)
    writer.writerow(header)
    for date in dates:
        row = [str(date)]
        for country in countries:
            try:
                row.append(values[country][str(date)])
            except:
                row.append(0)
        writer.writerow(row)
    f.close()


def get_average(values, month):
    sum = 0
    for key in values:
        if datetime.datetime.strptime(key, '%Y-%m-%d').month == month:
            sum += values[key]
    return sum / 12


# create impact values monthly file
def write_impact_values_monthly_file(countries, values):
    header = ['month'] + countries
    f = open('impact_data_monthly.csv', 'w')
    writer = csv.writer(f)
    writer.writerow(header)
    for month in range(1, 13):
        row = [month]
        for country in countries:
            try:
                average = get_average(values[country], month)
                row.append(average)
            except:
                row.append(0)
        writer.writerow(row)
    f.close()


# create country region file
def write_country_region_file(countries, countries_regions):
    header = ["country", "region", "level1", "level2"]
    f = open('country_regions.csv', 'w')
    writer = csv.writer(f)
    writer.writerow(header)
    for country in countries:
        row = [country] + countries_regions[country]
        writer.writerow(row)
    f.close()


if __name__ == '__main__':
    (dates, countries, values, countries_regions) = load_data()
    write_impact_values_file(dates, countries, values)
    write_impact_values_monthly_file(countries, values)
    write_country_region_file(countries, countries_regions)
