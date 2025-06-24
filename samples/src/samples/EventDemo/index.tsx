import React, { useState, useEffect, useRef } from 'react';
import { Button, Card, Typography, List, Tag, Row, Col, Space, Alert } from 'antd';
import { BellOutlined, ThunderboltOutlined, EyeOutlined, PlayCircleOutlined } from '@ant-design/icons';
import SampleContainer from '../../components/SampleContainer';
import { EventDemo3D, EventLog } from './EventDemo';

const { Text, Title } = Typography;

const EventDemo: React.FC = () => {
  const [eventLogs, setEventLogs] = useState<EventLog[]>([]);
  const [initError, setInitError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const demo3DRef = useRef<EventDemo3D | null>(null);

  const addEventLog = (log: EventLog) => {
    setEventLogs(prev => [log, ...prev.slice(0, 19)]);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const initializeDemo = async () => {
      try {
        demo3DRef.current = new EventDemo3D();
        demo3DRef.current.setEventLogCallback(addEventLog);
        await demo3DRef.current.initialize(containerRef.current!);
        setIsInitialized(true);
      } catch (error) {
        console.error('初始化失败:', error);
        setInitError(`初始化失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    };

    initializeDemo();

    // 清理函数
    return () => {
      if (demo3DRef.current) {
        demo3DRef.current.dispose();
        demo3DRef.current = null;
      }
    };
  }, []);

  // 触发系统事件
  const triggerSystemEvent = (eventType: string) => {
    if (demo3DRef.current) {
      demo3DRef.current.triggerSystemEvent(eventType);
    }
  };

  // 触发物体事件
  const triggerObjectEvent = (eventType: string) => {
    if (demo3DRef.current) {
      demo3DRef.current.triggerObjectEvent(eventType);
    }
  };

  // 清空事件日志
  const clearEventLogs = () => {
    setEventLogs([]);
  };

  if (initError) {
    return (
      <SampleContainer>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%',
          flexDirection: 'column',
          padding: 20
        }}>
          <Card title="⚠️ 初始化错误" style={{ maxWidth: 600 }}>
            <p>{initError}</p>
            <p style={{ marginTop: 16, fontSize: '14px', color: '#666' }}>
              本示例需要正确安装和配置 <code>@enerv-3d/core</code> 包。
            </p>
          </Card>
        </div>
      </SampleContainer>
    );
  }

  // 系统事件列表
  const systemEvents = ['CORE_CANVAS_RESIZE', 'CORE_OBJECT_SELECTED', 'CORE_LEVEL_CHANGE'];
  
  // 物体事件列表  
  const objectEvents = ['CLICK', 'DBCLICK', 'POINT_UP', 'POINT_DOWN', 'POINT_MOVE', 'POINT_OUT', 'POINT_OVER', 'WHEEL', 'KEY_DOWN', 'KEY_UP'];

  return (
    <SampleContainer>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
        
        {!isInitialized && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(255, 255, 255, 0.9)',
            padding: 20,
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <Text>正在初始化事件系统...</Text>
          </div>
        )}
        
        {/* 控制面板 */}
        <div style={{
          position: 'absolute',
          top: 20,
          right: 20,
          width: 400,
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 8,
          padding: 16,
          zIndex:10,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          backdropFilter: 'blur(10px)',
          maxHeight: 'calc(100vh - 40px)',
          overflowY: 'auto'
        }}>
          <Title level={5} style={{ margin: '0 0 16px 0', color: '#1890ff' }}>
            ⚡ EnerV3DCore 事件系统演示
          </Title>

          {/* 系统事件触发 */}
          <Card size="small" title={
            <span>
              <BellOutlined style={{ marginRight: 8 }} />
              系统事件 (SYSTEM_EVENTS)
            </span>
          } style={{ marginBottom: 16 }}>
            <Space wrap size="small">
              {systemEvents.map(eventType => (
                <Button
                  key={eventType}
                  size="small"
                  type="primary"
                  ghost
                  onClick={() => triggerSystemEvent(eventType)}
                  disabled={!isInitialized}
                >
                  {eventType}
                </Button>
              ))}
            </Space>
          </Card>

          {/* 物体事件触发 */}
          <Card size="small" title={
            <span>
              <ThunderboltOutlined style={{ marginRight: 8 }} />
              物体事件 (OBJECT_EVENTS)
            </span>
          } style={{ marginBottom: 16 }}>
            <Space wrap size="small">
              {objectEvents.map(eventType => (
                <Button
                  key={eventType}
                  size="small"
                  type="default"
                  onClick={() => triggerObjectEvent(eventType)}
                  disabled={!isInitialized}
                >
                  {eventType}
                </Button>
              ))}
            </Space>
          </Card>

          {/* 事件日志 */}
          <Card 
            size="small" 
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  <EyeOutlined style={{ marginRight: 8 }} />
                  事件日志 ({eventLogs.length})
                </span>
                <Button 
                  size="small" 
                  type="text" 
                  onClick={clearEventLogs}
                  disabled={eventLogs.length === 0}
                >
                  清空
                </Button>
              </div>
            }
          >
            <div style={{ 
              height: '200px', 
              overflowY: 'auto',
              border: '1px solid #f0f0f0',
              borderRadius: '6px',
              padding: '8px'
            }}>
              <List
                size="small"
                dataSource={eventLogs}
                renderItem={log => (
                  <List.Item style={{ 
                    padding: '4px 0',
                    borderBottom: '1px solid #f5f5f5'
                  }}>
                    <div style={{ width: '100%' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: 4
                      }}>
                        <Tag 
                          color={log.category === 'SYSTEM' ? 'blue' : 'green'}
                          style={{ margin: 0, fontSize: '10px' }}
                        >
                          {log.type}
                        </Tag>
                        <Text 
                          type="secondary" 
                          style={{ fontSize: '10px' }}
                        >
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </Text>
                      </div>
                      <Text style={{ fontSize: '12px', display: 'block' }}>
                        {log.description}
                      </Text>
                    </div>
                  </List.Item>
                )}
                locale={{ emptyText: '暂无事件记录' }}
              />
            </div>
          </Card>

          {/* 使用说明 */}
          <Alert
            message="使用说明"
            description={
              <div style={{ fontSize: '12px', lineHeight: 1.6 }}>
                <p>• 点击上方按钮可手动触发对应事件</p>
                <p>• 在3D画布上进行鼠标、键盘操作也会触发事件</p>
                <p>• 系统事件：画布调整、物体选择、层级变化</p>
                <p>• 物体事件：鼠标点击、移动、键盘输入等</p>
                <p>• 事件日志显示最近20条记录</p>
              </div>
            }
            type="info"
            showIcon
            style={{ marginTop: 16 }}
          />
        </div>
      </div>
    </SampleContainer>
  );
};

export default EventDemo;
