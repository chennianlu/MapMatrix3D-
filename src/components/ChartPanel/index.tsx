import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import './style.css';

interface ChartPanelProps {
  title: string;
  type: 'line' | 'bar' | 'pie' | 'radar';
  className?: string;
}

const ChartPanel: React.FC<ChartPanelProps> = ({ title, type, className }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current);
      
      // 根据图表类型设置不同的配置
      const option = getChartOption(type);
      chartInstance.current.setOption(option);
    }

    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, [type]);

  return (
    <div className={`chart-panel ${className || ''}`}>
      <div className="chart-title">{title}</div>
      <div className="chart-content" ref={chartRef} />
    </div>
  );
};

// 获取不同类型的图表配置
const getChartOption = (type: string) => {
  const baseOption = {
    backgroundColor: 'transparent',
    textStyle: {
      color: '#fff'
    },
    grid: {
      top: 40,
      right: 20,
      bottom: 20,
      left: 40,
      containLabel: true
    }
  };

  switch (type) {
    case 'line':
      return {
        ...baseOption,
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月'],
          axisLine: { lineStyle: { color: '#0c2747' } }
        },
        yAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: '#0c2747' } }
        },
        series: [{
          data: [820, 932, 901, 934, 1290, 1330],
          type: 'line',
          smooth: true,
          lineStyle: { color: '#4facfe' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(79,172,254,0.3)' },
              { offset: 1, color: 'rgba(79,172,254,0.1)' }
            ])
          }
        }]
      };

    case 'bar':
      return {
        ...baseOption,
        xAxis: {
          type: 'category',
          data: ['区域1', '区域2', '区域3', '区域4', '区域5'],
          axisLine: { lineStyle: { color: '#0c2747' } }
        },
        yAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: '#0c2747' } }
        },
        series: [{
          data: [120, 200, 150, 80, 70],
          type: 'bar',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#4facfe' },
              { offset: 1, color: '#00f2fe' }
            ])
          }
        }]
      };

    case 'pie':
      return {
        ...baseOption,
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          data: [
            { value: 1048, name: '煤炭' },
            { value: 735, name: '石油' },
            { value: 580, name: '天然气' },
            { value: 484, name: '水电' },
            { value: 300, name: '新能源' }
          ],
          label: {
            color: '#fff'
          }
        }]
      };

    case 'radar':
      return {
        ...baseOption,
        radar: {
          indicator: [
            { name: '效率', max: 100 },
            { name: '成本', max: 100 },
            { name: '环保', max: 100 },
            { name: '安全', max: 100 },
            { name: '创新', max: 100 }
          ],
          splitArea: {
            areaStyle: {
              color: ['rgba(79,172,254,0.1)']
            }
          },
          axisLine: {
            lineStyle: {
              color: '#0c2747'
            }
          }
        },
        series: [{
          type: 'radar',
          data: [{
            value: [80, 70, 90, 85, 75],
            name: '能源效率',
            areaStyle: {
              color: 'rgba(79,172,254,0.3)'
            },
            lineStyle: {
              color: '#4facfe'
            }
          }]
        }]
      };

    default:
      return baseOption;
  }
};

export default ChartPanel; 