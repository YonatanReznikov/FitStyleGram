import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const Stats = () => {
  const ref = useRef();

  useEffect(() => {
    fetch('http://localhost:5000/api/stats/monthly')
      .then(res => res.json())
      .then(data => {
        drawChart(data);
      });
  }, []);

  const drawChart = (data) => {
    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();

    const width = 600;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };

    const x = d3.scaleBand()
      .domain(data.map(d => `${d._id.month}/${d._id.year}`))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count)]).nice()
      .range([height - margin.bottom, margin.top]);

    const xAxis = g =>
      g.attr('transform', `translate(0,${height - margin.bottom})`)
       .call(d3.axisBottom(x));

    const yAxis = g =>
      g.attr('transform', `translate(${margin.left},0)`)
       .call(d3.axisLeft(y));

    svg.append('g').call(xAxis);
    svg.append('g').call(yAxis);

    svg.selectAll('.bar')
      .data(data)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', d => x(`${d._id.month}/${d._id.year}`))
      .attr('y', d => y(d.count))
      .attr('height', d => y(0) - y(d.count))
      .attr('width', x.bandwidth())
      .attr('fill', 'steelblue');
  };

  return (
    <div>
      <h2>📊 Group statistics per month</h2>
      <svg ref={ref} width="600" height="300"></svg>
    </div>
  );
};

export default Stats;
