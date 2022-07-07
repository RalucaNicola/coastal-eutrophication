import * as styles from '../SVGChart.module.css';

import { useEffect, useRef, useState, useContext } from 'react';
import {
  area,
  axisBottom,
  drag,
  max,
  pointer,
  scaleLinear,
  scaleOrdinal,
  scaleUtc,
  select,
  selectAll,
  stack,
  stackOffsetSilhouette
} from 'd3';

import { regionNames } from '../../../config';
import { AppContext } from '../../../contexts/AppContextProvider';

const margin = {
  top: 20,
  right: 30,
  bottom: 30,
  left: 20
};

const setThumbText = ({ xThumb, date, width }) => {
  const month = new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'UTC' }).format(date);
  const text = `Show ${month}, ${date.getUTCFullYear()}`;
  if (xThumb > width / 2) {
    select('.thumb-date')
      .attr('x', xThumb - 10)
      .style('text-anchor', 'end')
      .text(text);
    select('.thumb-info')
      .attr('x', xThumb - 10)
      .style('text-anchor', 'end');
  } else {
    select('.thumb-date')
      .attr('x', xThumb + 10)
      .style('text-anchor', 'start')
      .text(text);
    select('.thumb-info')
      .attr('x', xThumb + 10)
      .style('text-anchor', 'start');
  }
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
  console.log(timeValues[timeSlice]);
  const date = new Date(timeValues[timeSlice]);
  const xThumb = xScale(date);
  const yThumb = size.height - margin.bottom;
  select('.thumb-date').attr('y', yThumb - 30);
  select('.thumb-info').attr('y', yThumb - 10);
  setThumbText({ xThumb, date, width: size.width });
  select('.thumb-indicator').attr('x1', xThumb).attr('x2', xThumb).attr('y1', yThumb).attr('y2', 0);
  select('.thumb')
    .attr('cx', xThumb)
    .attr('cy', yThumb)
    .call(
      drag()
        .on('start', function () {
          select(this).raise().attr('stroke-width', 4);
        })
        .on('drag', function (event) {
          const x = Math.min(Math.max(event.x, margin.left), size.width - margin.right);

          const timeSlice = Math.round(
            (x - margin.left) / ((size.width - margin.right - margin.left) / (data.length - 1))
          );
          const date = new Date(timeValues[timeSlice]);

          select(this).attr('cx', x);
          select('.thumb-indicator').attr('x1', x).attr('x2', x);
          setThumbText({ xThumb: x, date, width: size.width });
        })
        .on('end', function (event) {
          select(this).attr('stroke-width', 2);
          const x = Math.min(Math.max(event.x, margin.left), size.width - margin.right);
          const timeSlice = Math.round(
            (x - margin.left) / ((size.width - margin.right - margin.left) / (data.length - 1))
          );
          const date = new Date(timeValues[timeSlice]);
          const xThumb = xScale(date);

          select(this).attr('cx', xThumb);
          select('.thumb-indicator').attr('x1', xThumb).attr('x2', xThumb);
          setThumbText({ xThumb, date, width: size.width });
          setTimeSlice(timeSlice);
        })
    );

  if (selection) {
    // build impact percentage scale

    const sumPercentages = data.map((d) => {
      let sum = 0;
      Object.keys(d).forEach((key) => {
        if (key !== 'date') {
          sum += parseFloat(d[key]);
        }
      });
      return sum;
    });
    let domainHeight = max(sumPercentages);
    if (data.columns.length === 1) {
      domainHeight = domainHeight * 2;
    }
    const yScale = scaleLinear()
      .domain([-domainHeight / 2, domainHeight / 2])
      .range([size.height - margin.bottom - 20, 20]);

    const keys = data.columns;

    // color scheme
    const colors = keys.map((key) => {
      if (key === data.selectedFeature.country) {
        return '#00D96D';
      } else {
        return '#888';
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
      .style('stroke', '#eee')
      .style('stroke-width', 0.25)
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
        resetTooltip(data.selectedFeature.country);
      })
      .on('click', (event, d) => {
        setCountry({ name: d.key, selectedFromMap: false });
      });
  }
};

const resetTooltip = (country) => {
  let htmlText = `<span>Select a zone to see the evolution of eutrophication impacted areas.</span>`;
  if (country) {
    htmlText = `<span>This chart shows the <b>percentage</b> of ${country}'s EEZ area impacted by eutrophication, through time. <br> Regional neighbors (also percent area impacted by eutrophication) are optionally shown, for comparison.</span>`;
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
  const month = new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'UTC' }).format(date);
  const value = parseFloat(d[timeSlice].data[d.key]);
  const htmlText = `<span class='country'>${d.key}</span> ${month}, ${date.getUTCFullYear()}</br> ${value.toFixed(
    2
  )}% <span class='emphasized'> eutrophication-impacted</span> area `;
  select('.tooltip').html(htmlText);
};

const mouseleave = function () {
  selectAll('.myArea').style('opacity', 1);
};

const YearlySVGChart = ({ data, selectedFeature, regionIndex, timeSlice, setTimeSlice, setCountry }) => {
  const chartRef = useRef();
  const svg = useRef();
  const [size, setSize] = useState();
  const [selectedData, setSelectedData] = useState(null);
  const { yearlyTimeDefinition: timeDefinition } = useContext(AppContext);
  // recalculate streamgraph data when region or selected country changes
  useEffect(() => {
    if (selectedFeature) {
      const region = regionNames[regionIndex].name;
      const countries = data.countryData.filter((c) => c[region] === selectedFeature[region]).map((c) => c.country);
      const selectedData = data.eutrophicationDataYearly.map((dataSlice) => {
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
          data: data.eutrophicationDataYearly,
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

      const svgContainer = select(chartRef.current).select('svg').attr('width', '100%').attr('height', '100%');
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
        <svg>
          <g className='chartArea'></g>
          <g className='xAxis'></g>
          <g className='tooltip' x={0} y={35}></g>
          <g className='indicator'>
            <line className='thumb-indicator'></line>
            <circle className='thumb' strokeWidth={2} r={7}></circle>
            <text className='thumb-date'></text>
            <text className='thumb-info'>Eutrophication rates on map</text>
          </g>
        </svg>
      </div>
    </>
  );
};

export default YearlySVGChart;
