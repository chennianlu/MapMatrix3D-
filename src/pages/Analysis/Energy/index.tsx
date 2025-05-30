import React from 'react';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';

type EnergyData = {
  id: number;
  date: string;
  type: string;
  consumption: number;
  unit: string;
  trend: 'up' | 'down';
  change: number;
};

const columns: ProColumns<EnergyData>[] = [
  {
    title: '日期',
    dataIndex: 'date',
    valueType: 'date',
  },
  {
    title: '能源类型',
    dataIndex: 'type',
  },
  {
    title: '消耗量',
    dataIndex: 'consumption',
    valueType: 'digit',
  },
  {
    title: '单位',
    dataIndex: 'unit',
  },
  {
    title: '趋势',
    dataIndex: 'trend',
    valueEnum: {
      up: { text: '上升', status: 'Error' },
      down: { text: '下降', status: 'Success' },
    },
  },
  {
    title: '变化率',
    dataIndex: 'change',
    valueType: 'percent',
  },
];

const mockData: EnergyData[] = [
  {
    id: 1,
    date: '2024-03-01',
    type: '电力',
    consumption: 1234.5,
    unit: 'kWh',
    trend: 'up',
    change: 0.15,
  },
  {
    id: 2,
    date: '2024-03-01',
    type: '天然气',
    consumption: 567.8,
    unit: 'm³',
    trend: 'down',
    change: -0.08,
  },
  {
    id: 3,
    date: '2024-03-02',
    type: '电力',
    consumption: 1189.2,
    unit: 'kWh',
    trend: 'down',
    change: -0.12,
  },
  {
    id: 4,
    date: '2024-03-02',
    type: '天然气',
    consumption: 589.3,
    unit: 'm³',
    trend: 'up',
    change: 0.05,
  },
];

const EnergyAnalysis: React.FC = () => {
  return (
    <PageContainer>
      <ProTable<EnergyData>
        columns={columns}
        dataSource={mockData}
        rowKey="id"
        search={false}
        dateFormatter="string"
        headerTitle="能源消耗分析"
        pagination={{
          pageSize: 10,
        }}
      />
    </PageContainer>
  );
};

export default EnergyAnalysis; 