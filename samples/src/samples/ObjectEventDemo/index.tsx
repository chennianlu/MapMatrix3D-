import React, { useRef, useEffect, useState } from 'react';
import { Button, Space, Card, Typography, Tag, List, Alert, Row, Col } from 'antd';
import SampleContainer from '../../components/SampleContainer';
import { ObjectEventDemo3D, ObjectEventLog, GeometryInfo } from './ObjectEventDemo';

const { Text, Title } = Typography;

const ObjectEventDemo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const demo3DRef = useRef<ObjectEventDemo3D | null>(null);
  const [geometries, setGeometries] = useState<GeometryInfo[]>([]);
  const [eventLogs, setEventLogs] = useState<ObjectEventLog[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  const addEventLog = (log: ObjectEventLog) => {
    setEventLogs(prev => [log, ...prev.slice(0, 19)]);
  };

  useEffect(() => {
    if (containerRef.current && !isInitialized) {
      const initializeDemo = async () => {
        try {
          demo3DRef.current = new ObjectEventDemo3D();
          demo3DRef.current.setEventLogCallback(addEventLog);
          await demo3DRef.current.initialize(containerRef.current!);
          
          // 获取初始几何体
          const initialGeometries = demo3DRef.current.getAllGeometries();
          setGeometries(initialGeometries);
          setIsInitialized(true);
          
        } catch (error) {
          console.error('初始化失败:', error);
          setInitError('无法加载 EnerV3DCore 模块。请确保已正确安装 @enerv-3d/core 包。');
        }
      };

      initializeDemo();
    }

    // 清理函数
    return () => {
      if (demo3DRef.current) {
        demo3DRef.current.dispose();
        demo3DRef.current = null;
      }
    };
  }, []);

  // 手动触发物体事件
  const triggerObjectEvent = (geometry: GeometryInfo, eventType: string) => {
    if (demo3DRef.current) {
      demo3DRef.current.triggerObjectEvent(geometry.id, eventType);
    }
  };

  // 切换对象可见性
  const toggleObjectVisibility = (geometryId: string) => {
    if (demo3DRef.current) {
      const newVisibility = demo3DRef.current.toggleObjectVisibility(geometryId);
      setGeometries(prev => prev.map(geo => 
        geo.id === geometryId ? { ...geo, visible: newVisibility } : geo
      ));
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

  const supportedEvents = ['CLICK', 'DBCLICK', 'POINT_OVER', 'POINT_OUT', 'POINT_DOWN', 'POINT_UP'];

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
            <Text>正在初始化物体事件系统...</Text>
          </div>
        )}
        
        {/* 控制面板 */}
        <div style={{
          position: 'absolute',
          top: 20,
          right: 20,
          width: 420,
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
            🎭 物体事件系统演示
          </Title>

          {/* 物体列表和事件触发 */}
          <Card size="small" title="物体事件触发" style={{ marginBottom: 16 }}>
            {geometries.map(geometry => (
              <div key={geometry.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: 8,
                  gap: 8
                }}>
                  <div 
                    style={{ 
                      width: 16, 
                      height: 16, 
                      backgroundColor: geometry.color,
                      borderRadius: 2,
                      opacity: geometry.visible ? 1 : 0.3
                    }} 
                  />
                  <Text strong style={{ flex: 1 }}>{geometry.name}</Text>
                  <Button 
                    size="small" 
                    type={geometry.visible ? 'primary' : 'default'}
                    onClick={() => toggleObjectVisibility(geometry.id)}
                  >
                    {geometry.visible ? '隐藏' : '显示'}
                  </Button>
                </div>
                <div style={{ marginLeft: 24 }}>
                  <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: 6 }}>
                    点击按钮触发事件：
                  </Text>
                  <Space wrap size="small">
                    {supportedEvents.map(eventType => (
                      <Button
                        key={eventType}
                        size="small"
                        type="text"
                        onClick={() => triggerObjectEvent(geometry, eventType)}
                        disabled={!isInitialized || !geometry.visible}
                        style={{ 
                          fontSize: '10px', 
                          padding: '2px 6px',
                          height: 'auto',
                          lineHeight: 1.2
                        }}
                      >
                        {eventType}
                      </Button>
                    ))}
                  </Space>
                </div>
              </div>
            ))}
          </Card>

          {/* 事件日志 */}
          <Card 
            size="small" 
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>事件日志 ({eventLogs.length})</span>
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
            style={{ marginBottom: 16 }}
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
                    padding: '6px 0',
                    borderBottom: '1px solid #f5f5f5'
                  }}>
                    <div style={{ width: '100%' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: 4
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div 
                            style={{ 
                              width: 8, 
                              height: 8, 
                              backgroundColor: log.color,
                              borderRadius: '50%'
                            }} 
                          />
                          <Tag 
                            color="blue"
                            style={{ margin: 0, fontSize: '10px', padding: '0 4px' }}
                          >
                            {log.eventType}
                          </Tag>
                          <Text 
                            strong 
                            style={{ fontSize: '11px', color: log.color }}
                          >
                            {log.objectName}
                          </Text>
                        </div>
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
                <p>• 直接在3D画布中与物体交互触发真实事件</p>
                <p>• 点击上方按钮可手动触发对应的物体事件</p>
                <p>• 支持的事件：点击、双击、悬停进入/离开、鼠标按下/抬起</p>
                <p>• 事件日志显示最近20条记录</p>
                <p>• 隐藏的物体不会响应事件</p>
              </div>
            }
            type="info"
            showIcon
          />
        </div>
      </div>
    </SampleContainer>
  );
};

export default ObjectEventDemo; 