import Papa from 'papaparse';
import { useState, useEffect } from 'react';

const useEutrophicationData = () => {
  const [dataResponse, setResponse] = useState();

  const [isLoading, setIsLoading] = useState(true);

  const [isFailed, setIsFailed] = useState(false);

  const fetchData = async () => {
    setIsFailed(false);
    setIsLoading(true);
    try {
      const countryResponse = await fetch('./data/country_regions.csv');
      const countryText = await countryResponse.text();
      const countryData = Papa.parse(countryText, { delimiter: ',', dynamicaTyping: true }).data.slice(1);

      const eutrophicationResponse = await fetch('./data/impact_data_total.csv');
      const eutrophicationText = await eutrophicationResponse.text();
      const eutrophicationData = Papa.parse(eutrophicationText, { delimiter: ',', dynamicaTyping: true }).data.slice(1);

      setResponse({
        countryData,
        eutrophicationData
      });
    } catch (err) {
      setIsFailed(true);
      setResponse(null);
    }

    setIsLoading(false);
  };

  const resetIsFailed = () => {
    setIsFailed(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    dataResponse,
    isLoading,
    isFailed,
    resetIsFailed
  };
};

export default useEutrophicationData;
