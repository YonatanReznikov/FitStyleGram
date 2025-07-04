import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const MonthlyStats = () => {
  const chartRef = useRef();

  useEffect(() => {
    fetch('http://localhost:5000/api/stats/monthly') 
      .then(res => res.json())
      .then(data => {
        const svg = d3.select(chartRef.current)
          .attr('width', 600)
          .attr('height', 400);

        svg.selectAll('*').remove(); 

        const dataset = data.map(item => ({
          date: `${item._id.month}/${item._id.year}`,
          count: item.count
        }));

        const x = d3.scaleBand()
          .domain(dataset.map(d => d.date))
          .range([50, 550])
          .padding(0.2);

        const y = d3.scaleLinear()
          .domain([0, d3.max(dataset, d => d.count)])
          .range([350, 50]);

        svg.append('g')
          .attr('transform', 'translate(0, 350)')
          .call(d3.axisBottom(x));

        svg.append('g')
          .attr('transform', 'translate(50, 0)')
          .call(d3.axisLeft(y));

        svg.selectAll('rect')
          .data(dataset)
          .enter()
          .append('rect')
          .attr('x', d => x(d.date))
          .attr('y', d => y(d.count))
          .attr('width', x.bandwidth())
          .attr('height', d => 350 - y(d.count))
          .attr('fill', 'steelblue');
      });
  }, []);

  return (
    <div>
      <h2>Statistics</h2>
      <svg ref={chartRef}></svg>
    </div>
  );
};

export default MonthlyStats;
