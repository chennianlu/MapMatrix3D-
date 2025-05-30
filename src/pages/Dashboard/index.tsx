import React from 'react';
import { PageContainer, ProCard, StatisticCard } from '@ant-design/pro-components';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Statistic } = StatisticCard;

const Dashboard: React.FC = () => {
  return (
    <PageContainer>
      <ProCard split="vertical">
        <StatisticCard
          title="能源消耗"
          chart={
            <img
              src="https://gw.alipayobjects.com/zos/alicdn/BA_R9SIAV/charts.svg"
              alt="chart"
              width="100%"
            />
          }
        >
          <Statistic
            title="日同比"
            value="11.28%"
            trend={{ value: 'up', isRed: false }}
            suffix={<ArrowUpOutlined />}
          />
          <Statistic
            title="周同比"
            value="3.85%"
            trend={{ value: 'down', isRed: true }}
            suffix={<ArrowDownOutlined />}
          />
        </StatisticCard>
        <StatisticCard
          title="碳排放"
          chart={
            <img
              src="https://gw.alipayobjects.com/zos/alicdn/BA_R9SIAV/charts.svg"
              alt="chart"
              width="100%"
            />
          }
        >
          <Statistic
            title="日同比"
            value="8.15%"
            trend={{ value: 'up', isRed: false }}
            suffix={<ArrowUpOutlined />}
          />
          <Statistic
            title="周同比"
            value="2.35%"
            trend={{ value: 'down', isRed: true }}
            suffix={<ArrowDownOutlined />}
          />
        </StatisticCard>
      </ProCard>
    </PageContainer>
  );
};

export default Dashboard; 