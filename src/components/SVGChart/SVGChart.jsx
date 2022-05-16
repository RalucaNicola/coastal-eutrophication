import * as styles from './SVGChart.module.css';

import { useEffect, useRef, useState } from 'react';
import {
  select,
  extent,
  scaleUtc,
  axisBottom,
  scaleLinear,
  scaleOrdinal,
  stack,
  stackOffsetSilhouette,
  area
} from 'd3';

import { regionNames } from '../../config';

const margin = {
  top: 20,
  right: 30,
  bottom: 30,
  left: 20
};

const drawChart = ({ svg, size, data, selection }) => {
  // build time scale
  const xRange = [margin.left, size.width - margin.right];
  const xScale = scaleUtc(
    extent(data, (d) => new Date(d.date)),
    xRange
  );
  const xAxis = axisBottom(xScale).ticks(10);
  svg
    .select('.xAxis')
    .attr('transform', `translate(0,${size.height - margin.bottom})`)
    .call(xAxis);

  svg.selectAll('.myArea').remove();
  if (selection) {
    // build impact percentage scale
    let domainHeight;
    if (data.columns.length > 40) {
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
      );
  }
};

const SVGChart = ({ data, selectedFeature, regionIndex }) => {
  const chartRef = useRef();
  const svg = useRef();
  const [size, setSize] = useState();
  const [selectedData, setSelectedData] = useState(null);

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
    if (size && svg.current) {
      if (selectedData) {
        drawChart({ svg: svg.current, size, data: selectedData, selection: true });
      } else {
        drawChart({ svg: svg.current, size, data: data.eutrophicationData, selection: false });
      }
    }
  }, [size, svg.current, selectedData]);

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
      svgContainer.append('g').classed('xAxis', true);
      svg.current = svgContainer;

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [chartRef.current]);

  return (
    <div ref={chartRef} className={styles.chartContainer}>
      <svg></svg>
    </div>
  );
};

export default SVGChart;
