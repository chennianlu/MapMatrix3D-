import React, { useRef, useEffect, useState } from 'react';
import { Button, Space, Card, Typography } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import SampleContainer from '../../components/SampleContainer';
import { CoreGeometryDemo3D, GeometryInfo } from './CoreGeometryDemo';

const { Text, Title } = Typography;

const CoreGeometryDemo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const demo3DRef = useRef<CoreGeometryDemo3D | null>(null);
  const [geometries, setGeometries] = useState<GeometryInfo[]>([]);
  const [selectedGeometry, setSelectedGeometry] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    if (containerRef.current && !isInitialized) {
      const initializeDemo = async () => {
        try {
          demo3DRef.current = new CoreGeometryDemo3D();
          await demo3DRef.current.initialize(containerRef.current!);
          
          // 获取初始几何体
          const initialGeometries = demo3DRef.current.getAllGeometries();
          setGeometries(initialGeometries);
          setIsInitialized(true);
          
        } catch (error) {
          console.error('初始化失败:', error);
          setInitError(`初始化失败: ${error instanceof Error ? error.message : '未知错误'}`);
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

  const addGeometry = (type: 'box' | 'sphere' | 'cylinder') => {
    if (!demo3DRef.current) return;

    let geometryParam: any = {};
    switch (type) {
      case 'box':
        geometryParam = { 
          width: 5 + Math.random() * 10, 
          height: 5 + Math.random() * 10, 
          depth: 5 + Math.random() * 10 
        };
        break;
      case 'sphere':
        geometryParam = { 
          radius: 3 + Math.random() * 6, 
          widthSegments: 16, 
          heightSegments: 12 
        };
        break;
      case 'cylinder':
        geometryParam = { 
          radius: 2 + Math.random() * 5, 
          height: 6 + Math.random() * 8, 
          radialSegments: 16 
        };
        break;
    }

    const newGeometry = demo3DRef.current.createGeometry(type, geometryParam);
    if (newGeometry) {
      // 随机位置
      const x = (Math.random() - 0.5) * 40;
      const z = (Math.random() - 0.5) * 40;
      newGeometry.object!.position.set(x, 0, z);

      setGeometries(prev => [...prev, newGeometry]);
    }
  };

  const removeGeometry = (id: string) => {
    if (!demo3DRef.current) return;

    const success = demo3DRef.current.removeGeometry(id);
    if (success) {
      setGeometries(prev => prev.filter(g => g.id !== id));
      if (selectedGeometry === id) {
        setSelectedGeometry(null);
      }
    }
  };

  const toggleVisibility = (id: string) => {
    if (!demo3DRef.current) return;

    const newVisibility = demo3DRef.current.toggleGeometryVisibility(id);
    setGeometries(prev => prev.map(geo => 
      geo.id === id ? { ...geo, visible: newVisibility } : geo
    ));
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
            zIndex:10,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <Text>正在初始化 EnerV3DCore...</Text>
          </div>
        )}
        
        {/* 控制面板 */}
        <div style={{
          position: 'absolute',
          top: 20,
          right: 20,
          width: 360,
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 8,
          padding: 16,
          zIndex:10,

          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          backdropFilter: 'blur(10px)',
          maxHeight: 'calc(100vh - 120px)',
          overflowY: 'auto'
        }}>
          <Title level={5} style={{ margin: '0 0 16px 0', color: '#1890ff' }}>
            🎯 EnerV3DCore 几何体展示
          </Title>

          {/* 添加几何体按钮 */}
          <Card size="small" title="添加几何体" style={{ marginBottom: 16 }}>
            <Space wrap>
              <Button 
                type="primary" 
                size="small"
                onClick={() => addGeometry('box')}
              >
                添加立方体
              </Button>
              <Button 
                type="primary" 
                size="small"
                onClick={() => addGeometry('sphere')}
              >
                添加球体
              </Button>
              <Button 
                type="primary" 
                size="small"
                onClick={() => addGeometry('cylinder')}
              >
                添加圆柱体
              </Button>
            </Space>
          </Card>

          {/* 几何体列表 */}
          <Card size="small" title={`几何体列表 (${geometries.length})`} style={{ marginBottom: 16 }}>
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {geometries.map(geo => (
                <div key={geo.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: selectedGeometry === geo.id ? '2px solid #1890ff' : '1px solid #f0f0f0'
                }}>
                  <div 
                    style={{ 
                      cursor: 'pointer',
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                    onClick={() => setSelectedGeometry(geo.id)}
                  >
                    <div 
                      style={{ 
                        width: 16, 
                        height: 16, 
                        backgroundColor: geo.color,
                        borderRadius: 2,
                        opacity: geo.opacity 
                      }} 
                    />
                    <Text 
                      style={{ 
                        fontSize: 12, 
                        opacity: geo.visible ? 1 : 0.5,
                        textDecoration: geo.visible ? 'none' : 'line-through'
                      }}
                    >
                      {geo.name}
                    </Text>
                  </div>
                  <Space size="small">
                    <Button
                      type="text"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => toggleVisibility(geo.id)}
                      style={{ 
                        color: geo.visible ? '#52c41a' : '#d9d9d9',
                        padding: '0 4px'
                      }}
                    />
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeGeometry(geo.id)}
                      style={{ padding: '0 4px' }}
                    />
                  </Space>
                </div>
              ))}
              {geometries.length === 0 && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  暂无几何体
                </Text>
              )}
            </div>
          </Card>

          {/* 选中几何体信息 */}
          {selectedGeometry && (
            <Card size="small" title="几何体信息" style={{ marginBottom: 16 }}>
              {(() => {
                const selected = geometries.find(g => g.id === selectedGeometry);
                if (!selected) return null;
                
                return (
                  <div style={{ fontSize: 12 }}>
                    <p><strong>名称:</strong> {selected.name}</p>
                    <p><strong>类型:</strong> {selected.type}</p>
                    <p><strong>颜色:</strong> <span style={{color: selected.color}}>{selected.color}</span></p>
                    <p><strong>透明度:</strong> {selected.opacity}</p>
                    <p><strong>可见性:</strong> {selected.visible ? '可见' : '隐藏'}</p>
                  </div>
                );
              })()}
            </Card>
          )}

          {/* 操作说明 */}
          <Card size="small" title="操作说明">
            <div style={{ fontSize: 12, lineHeight: 1.6 }}>
              <p>• 点击几何体名称可选择对象</p>
              <p>• 眼睛图标可切换可见性</p>
              <p>• 垃圾桶图标可删除几何体</p>
              <p>• 鼠标拖拽可旋转视角</p>
              <p>• 滚轮可缩放场景</p>
            </div>
          </Card>
        </div>
      </div>
    </SampleContainer>
  );
};

export default CoreGeometryDemo;