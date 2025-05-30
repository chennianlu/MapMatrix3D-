import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, Checkbox, message, Spin } from 'antd';
import { UserOutlined, LockOutlined, HomeOutlined } from '@ant-design/icons';
import { login, getTenantIdByName } from '../../service/api/user';
import SlideCaptcha from '../../components/SlideCaptcha';
import { getAccessToken, setToken, setTenantId } from '../../utils/auth';

import './style.css';

interface LoginFormData {
  tenantName?: string;
  username: string;
  password: string;
  captchaVerification?: string;
  rememberMe: boolean;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [systemLoading, setSystemLoading] = useState(false);
  const [captchaVerification, setCaptchaVerification] = useState('');
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [tenantEnable] = useState(import.meta.env.VITE_APP_TENANT_ENABLE === 'true');
  const [captchaEnable] = useState(import.meta.env.VITE_APP_CAPTCHA_ENABLE === 'true');

  // 检查是否已登录
  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  // 获取记住的登录信息
  useEffect(() => {
    const savedForm = localStorage.getItem('loginForm');
    if (savedForm) {
      const formData = JSON.parse(savedForm);
      form.setFieldsValue(formData);
    }
  }, [form]);

  // 监听验证码变化，自动调用登录
  useEffect(() => {
    if (captchaVerification && captchaEnable) {
      handleLogin();
    }
  }, [captchaVerification]);

  const getTenantId = async (tenantName: string) => {
    if (tenantEnable) {
      const res = await getTenantIdByName(tenantName);
      setTenantId(res);
    }
  };

  const handleLogin = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // 如果开启了记住我，保存表单数据
      if (values.rememberMe) {
        localStorage.setItem('loginForm', JSON.stringify(values));
      } else {
        localStorage.removeItem('loginForm');
      }

      // 获取租户ID
      if (tenantEnable) {
        await getTenantId(values.tenantName);
      }
      
      // 添加验证码认证结果
      const loginData = {
        ...values,
        captchaVerification
      };
      
      const res = await login(loginData);
      if (res) {
        setToken(res);
        message.success('登录成功');
        setSystemLoading(true);
        // 判断是否为SSO登录
        const redirect = location.search.replace('?redirect=', '');
        if (redirect.indexOf('sso') !== -1) {
          window.location.href = window.location.href.replace('/login?redirect=', '');
        } else {
          navigate(redirect || '/', { replace: true });
        }
      } else {
        message.error(res.msg || '登录失败');
        // 登录失败时重置验证码
        setCaptchaVerification('');
        setShowCaptcha(true);
      }
    } catch (error: any) {
      message.error(error.message || '登录请求失败');
      // 发生错误时重置验证码
      setCaptchaVerification('');
      setShowCaptcha(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCaptchaSuccess = (verification: string) => {
    setCaptchaVerification(verification);
    setShowCaptcha(false);
  };

  const handleSubmit = async () => {
    if (captchaEnable) {
      setShowCaptcha(true);
    } else {
      handleLogin();
    }
  };

  return (
    <div className="login-container">
      <Spin spinning={systemLoading} tip="正在加载系统中...">
        <div className="login-box">
          <h2>能源大数据可视化平台</h2>
          <Form
            form={form}
            name="login"
            onFinish={handleSubmit}
            initialValues={{ rememberMe: true }}
            size="large"
          >
            {tenantEnable && (
              <Form.Item
                name="tenantName"
                rules={[{ required: true, message: '请输入租户名称' }]}
              >
                <Input
                  prefix={<HomeOutlined />}
                  placeholder="请输入租户名称"
                  type="primary"
                />
              </Form.Item>
            )}

            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="请输入用户名"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入密码"
                onPressEnter={handleSubmit}
              />
            </Form.Item>

            <Form.Item>
              <div className="login-options">
                <Form.Item name="rememberMe" valuePropName="checked" noStyle>
                  <Checkbox>记住我</Checkbox>
                </Form.Item>
                <a className="forgot-password" onClick={() => message.info('请联系管理员重置密码')}>
                  忘记密码？
                </a>
              </div>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="login-button"
                loading={loading}
                block
              >
                登录
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Spin>

      {captchaEnable && (
        <SlideCaptcha
          visible={showCaptcha}
          onClose={() => setShowCaptcha(false)}
          onSuccess={handleCaptchaSuccess}
          onFail={() => setShowCaptcha(false)}
        />
      )}
    </div>
  );
};

export default Login; 