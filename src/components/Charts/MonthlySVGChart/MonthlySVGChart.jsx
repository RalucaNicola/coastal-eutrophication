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
import { months } from '../../../utils';

const margin = {
  top: 20,
  right: 30,
  bottom: 30,
  left: 20
};

const setThumbText = ({ xThumb, month, width }) => {
  const text = `Show average value for ${months[month - 1]}`;
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
  // // build time scale
  const xRange = [margin.left, size.width - margin.right];
  const xExtent = [timeValues[0], timeValues[timeValues.length - 1]];
  const xScale = scaleLinear(xExtent, xRange);
  const xAxis = axisBottom(xScale)
    .ticks(Math.min(Math.round(size.width / 80), timeValues.length))
    .tickFormat(function (d) {
      return months[d - 1];
    });
  svg
    .select('.xAxis')
    .attr('transform', `translate(0,${size.height - margin.bottom})`)
    .call(xAxis);

  svg.selectAll('.countryArea').remove();

  const country = selection ? data.selectedFeature.country : null;
  resetTooltip(country);
  const month = timeValues[timeSlice];
  const xThumb = xScale(month);
  const yThumb = size.height - margin.bottom;
  select('.thumb-date').attr('y', yThumb - 30);
  select('.thumb-info').attr('y', yThumb - 10);
  setThumbText({ xThumb, month, width: size.width });
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
          const month = timeValues[timeSlice];

          select(this).attr('cx', x);
          select('.thumb-indicator').attr('x1', x).attr('x2', x);
          setThumbText({ xThumb: x, month, width: size.width });
        })
        .on('end', function (event) {
          select(this).attr('stroke-width', 2);
          const x = Math.min(Math.max(event.x, margin.left), size.width - margin.right);
          const timeSlice = Math.round(
            (x - margin.left) / ((size.width - margin.right - margin.left) / (data.length - 1))
          );
          const month = timeValues[timeSlice];
          const xThumb = xScale(month);

          select(this).attr('cx', xThumb);
          select('.thumb-indicator').attr('x1', xThumb).attr('x2', xThumb);
          setThumbText({ xThumb, month, width: size.width });
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
      domainHeight = domainHeight * 4;
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
      .selectAll('.countryArea')
      .data(stackedData)
      .join('path')
      .attr('class', 'countryArea')
      .style('fill', (d) => color(d.key))
      .style('stroke', '#eee')
      .style('stroke-width', 0.25)
      .attr(
        'd',
        area()
          .x((d) => xScale(parseInt(d.data.date)))
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
  selectAll('.countryArea').style('opacity', 0.2);
  select(this).style('opacity', 1);
};

const mousemove = function (event, d, size) {
  const x = pointer(event)[0];
  const timeSlice = Math.round((x - margin.left) / ((size.width - margin.right - margin.left) / 11));
  const month = parseInt(d[timeSlice].data.date);
  const value = parseFloat(d[timeSlice].data[d.key]);
  const htmlText = `<span class='country'>${d.key}</span> ${months[month - 1]}</br> ${value.toFixed(
    2
  )}% <span class='emphasized'> eutrophication-impacted</span> area `;
  select('.tooltip').html(htmlText);
};

const mouseleave = function () {
  selectAll('.countryArea').style('opacity', 1);
};

const MonthlySVGChart = ({ data, selectedFeature, regionIndex, timeSlice, setTimeSlice, setCountry }) => {
  const chartRef = useRef();
  const svg = useRef();
  const [size, setSize] = useState();
  const [selectedData, setSelectedData] = useState(null);
  const { monthlyTimeDefinition: timeDefinition } = useContext(AppContext);
  // recalculate streamgraph data when region or selected country changes
  useEffect(() => {
    if (selectedFeature) {
      const region = regionNames[regionIndex].name;
      const countries = data.countryData.filter((c) => c[region] === selectedFeature[region]).map((c) => c.country);
      const selectedData = data.eutrophicationDataMonthly.map((dataSlice) => {
        let slice = {
          date: dataSlice.month
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

  //redraw chart when size, container or selected data changes
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
      } else {
        drawChart({
          svg: svg.current,
          size,
          data: data.eutrophicationDataMonthly,
          selection: false,
          timeSlice,
          setTimeSlice,
          timeDefinition
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

export default MonthlySVGChart;
