import * as styles from './SVGChart.module.css';

import { useEffect, useRef, useState, useContext } from 'react';
import {
  area,
  axisBottom,
  drag,
  pointer,
  scaleLinear,
  scaleOrdinal,
  scaleUtc,
  select,
  selectAll,
  stack,
  stackOffsetSilhouette
} from 'd3';

import { regionNames } from '../../config';
import { AppContext } from '../../contexts/AppContextProvider';

const margin = {
  top: 20,
  right: 30,
  bottom: 30,
  left: 20
};

const drawChart = ({ svg, size, data, selection, timeSlice, setTimeSlice, timeDefinition, setCountry }) => {
  const timeValues = timeDefinition[0].values;
  // build time scale
  const xRange = [margin.left, size.width - margin.right];
  const timeExtent = [new Date(timeValues[0]), new Date(timeValues[timeValues.length - 1])];
  const xScale = scaleUtc(timeExtent, xRange);
  const xAxis = axisBottom(xScale).ticks(Math.round(size.width / 50));
  svg
    .select('.xAxis')
    .attr('transform', `translate(0,${size.height - margin.bottom})`)
    .call(xAxis);

  svg.selectAll('.myArea').remove();

  const country = selection ? data.selectedFeature.country : null;
  resetTooltip(country);

  select('.thumb')
    .attr('cx', xScale(new Date(timeDefinition[0].values[timeSlice])))
    .attr('cy', size.height - margin.bottom)
    .attr('r', 7)
    .attr('fill', 'white')
    .attr('stroke', '#4a4a4a')
    .attr('stroke-width', 2)
    .call(
      drag()
        .on('start', function () {
          select(this).raise().attr('stroke-width', 4);
        })
        .on('drag', function (event) {
          const x = Math.min(Math.max(event.x, margin.left), size.width - margin.right);
          select(this)
            .attr('cx', x)
            .attr('cy', size.height - margin.bottom);
        })
        .on('end', function (event) {
          select(this).attr('stroke-width', 2);
          const x = Math.min(Math.max(event.x, margin.left), size.width - margin.right);
          const timeSlice = Math.floor(
            (x - margin.left) / ((size.width - margin.right - margin.left) / (data.length - 1))
          );
          setTimeSlice(timeSlice);
        })
    );

  if (selection) {
    // build impact percentage scale
    let domainHeight;
    console.log(data.columns);
    if (data.columns.length > 30) {
      domainHeight = 700;
    } else if (data.columns.length === 1) {
      domainHeight = 50;
    } else {
      domainHeight = 150;
    }
    const yScale = scaleLinear()
      .domain([-domainHeight, domainHeight])
      .range([size.height - margin.bottom, 0]);

    const keys = data.columns;

    // color scheme
    const colors = keys.map((key) => {
      if (key === data.selectedFeature.country) {
        return '#00D96D';
      } else {
        return '#eee';
      }
    });

    const color = scaleOrdinal().domain(keys).range(colors);

    const stackedData = stack().offset(stackOffsetSilhouette).keys(keys)(data);
    svg
      .select('.chartArea')
      .selectAll('.myArea')
      .data(stackedData)
      .join('path')
      .attr('class', 'myArea')
      .style('fill', (d) => color(d.key))
      .style('stroke', '#ccc')
      .style('stroke-width', 0.5)
      .attr(
        'd',
        area()
          .x((d) => xScale(new Date(d.data.date)))
          .y0((d) => yScale(d[0]))
          .y1((d) => yScale(d[1]))
      )
      .on('mouseover', mouseover)
      .on('mousemove', (event, d) => {
        mousemove(event, d, size);
      })
      .on('mouseleave', () => {
        mouseleave(data.selectedFeature.country);
      })
      .on('click', (event, d) => {
        setCountry(d.key);
      });
  }
};

const resetTooltip = (selectedCountry) => {
  let htmlText = `<span>Select a country to see the evolution of eutrophication anomalies.</span>`;
  if (selectedCountry) {
    htmlText = `<span>Eutrophication impact area (%) for ${selectedCountry}</span>`;
  }
  select('.tooltip').html(htmlText);
};

const mouseover = function () {
  selectAll('.myArea').style('opacity', 0.2);
  select(this).style('opacity', 1);
};

const mousemove = function (event, d, size) {
  const x = pointer(event)[0];
  const timeSlice = Math.floor((x - margin.left) / ((size.width - margin.right - margin.left) / 204));
  const date = new Date(d[timeSlice].data.date);
  const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
  const value = parseFloat(d[timeSlice].data[d.key]);
  const htmlText = `<span class='country'>${d.key}</span> ${month}, ${date.getFullYear()}</br> ${value.toFixed(
    2
  )}% <span class='emphasized'> eutrophication-impacted</span> area `;
  select('.tooltip').html(htmlText);
};

const mouseleave = function () {
  selectAll('.myArea').style('opacity', 1);
};

const SVGChart = ({ data, selectedFeature, regionIndex, timeSlice, setTimeSlice, setCountry }) => {
  const chartRef = useRef();
  const svg = useRef();
  const [size, setSize] = useState();
  const [selectedData, setSelectedData] = useState(null);
  const { timeDefinition } = useContext(AppContext);

  // recalculate streamgraph data when region or selected country changes
  useEffect(() => {
    if (selectedFeature) {
      const region = regionNames[regionIndex];
      const countries = data.countryData.filter((c) => c[region] === selectedFeature[region]).map((c) => c.country);
      const selectedData = data.eutrophicationData.map((dataSlice) => {
        let slice = {
          date: dataSlice.date
        };
        countries.forEach((country) => (slice[country] = dataSlice[country]));

        return slice;
      });
      selectedData.columns = countries;
      selectedData.selectedFeature = selectedFeature;
      setSelectedData(selectedData);
    } else {
      setSelectedData(null);
    }
  }, [selectedFeature, regionIndex]);

  // redraw chart when size, container or selected data changes
  useEffect(() => {
    if (size && svg.current && timeDefinition) {
      if (selectedData) {
        drawChart({
          svg: svg.current,
          size,
          data: selectedData,
          selection: true,
          timeSlice,
          setTimeSlice,
          timeDefinition,
          setCountry
        });
        svg.current.on('mouseleave', () => {
          resetTooltip(selectedData.selectedFeature.country);
        });
      } else {
        drawChart({
          svg: svg.current,
          size,
          data: data.eutrophicationData,
          selection: false,
          timeSlice,
          setTimeSlice,
          timeDefinition
        });
        svg.current.on('mouseleave', () => {
          resetTooltip(null);
        });
      }
    }
  }, [size, svg, selectedData, timeDefinition]);

  // initialization
  useEffect(() => {
    if (chartRef.current) {
      const resizeObserver = new ResizeObserver((elements) => {
        const { height, width } = elements[0].contentRect;
        setSize({ height, width });
      });
      resizeObserver.observe(chartRef.current);

      const svgContainer = select(chartRef.current)
        .select('svg')
        .attr('width', '100%')
        .attr('height', chartRef.current.offsetHeight);
      svgContainer.append('g').classed('chartArea', true);
      svgContainer.append('g').classed('xAxis', true);
      svgContainer.append('g').classed('tooltip', true).attr('x', 0).attr('y', 35);
      svgContainer.append('circle').classed('thumb', true);
      svg.current = svgContainer;

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [chartRef]);

  return (
    <>
      <div className='tooltip'></div>
      <div ref={chartRef} className={styles.chartContainer}>
        <svg></svg>
      </div>
    </>
  );
};

export default SVGChart;
