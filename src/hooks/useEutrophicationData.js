import { csv } from 'd3';
import { useState, useEffect } from 'react';

const useEutrophicationData = () => {
  const [dataResponse, setResponse] = useState();

  const [isLoading, setIsLoading] = useState(true);

  const [isFailed, setIsFailed] = useState(false);

  const fetchData = async () => {
    setIsFailed(false);
    setIsLoading(true);
    try {
      const countryData = await csv('./data/country_regions.csv');
      const eutrophicationData = await csv('./data/impact_data_total.csv');

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
