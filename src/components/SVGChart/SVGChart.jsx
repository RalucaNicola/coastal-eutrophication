import * as styles from './SVGChart.module.css';

import { useEffect, useRef, useState } from 'react';
import { select, extent, scaleUtc, axisBottom } from 'd3';

const margin = {
  top: 20,
  right: 30,
  bottom: 30,
  left: 20
};

const SVGChart = ({ data }) => {
  const chartRef = useRef();
  const svg = useRef();
  const [size, setSize] = useState();
  // data is not in the right format...

  useEffect(() => {
    if (size && svg.current) {
      const xRange = [margin.left, size.width - margin.right];
      const xScale = scaleUtc(
        extent(data, (d) => new Date(d.date)),
        xRange
      );
      const xAxis = axisBottom(xScale).ticks(10);
      svg.current
        .select('.xAxis')
        .attr('transform', `translate(0,${size.height - margin.bottom})`)
        .call(xAxis);
    }
  }, [size, svg.current]);

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
