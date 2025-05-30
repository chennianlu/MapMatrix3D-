import React from 'react';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Line } from '@ant-design/plots';

const CarbonAnalysis: React.FC = () => {
  const data = [
    { date: '2024-01', value: 350 },
    { date: '2024-02', value: 320 },
    { date: '2024-03', value: 280 },
    { date: '2024-04', value: 250 },
    { date: '2024-05', value: 220 },
    { date: '2024-06', value: 200 },
  ];

  const config = {
    data,
    xField: 'date',
    yField: 'value',
    smooth: true,
    height: 300,
    autoFit: true,
    xAxis: {
      type: 'cat',
    },
    yAxis: {
      title: {
        text: '碳排放量 (吨)',
      },
    },
  };

  return (
    <PageContainer>
      <ProCard title="碳排放趋势">
        <Line {...config} />
      </ProCard>
      <ProCard
        title="碳排放构成"
        style={{ marginTop: 16 }}
        split="vertical"
      >
        <ProCard title="直接排放">
          <div style={{ padding: '20px' }}>
            <h3>生产设备: 45%</h3>
            <h3>运输车辆: 30%</h3>
            <h3>其他设施: 25%</h3>
          </div>
        </ProCard>
        <ProCard title="间接排放">
          <div style={{ padding: '20px' }}>
            <h3>外购电力: 60%</h3>
            <h3>外购热力: 25%</h3>
            <h3>其他能源: 15%</h3>
          </div>
        </ProCard>
      </ProCard>
    </PageContainer>
  );
};

export default CarbonAnalysis; 