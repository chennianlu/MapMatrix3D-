interface LoginResponse {
  success: boolean;
  token?: string;
  message: string;
}

// 模拟用户数据
const users = [
  {
    username: 'admin',
    password: 'admin123',
    token: 'mock-token-admin'
  },
  {
    username: 'user',
    password: 'user123',
    token: 'mock-token-user'
  }
];

// 模拟登录接口
export const mockLogin = async (username: string, password: string): Promise<LoginResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = users.find(
        u => u.username === username && u.password === password
      );

      if (user) {
        resolve({
          success: true,
          token: user.token,
          message: '登录成功'
        });
      } else {
        resolve({
          success: false,
          message: '用户名或密码错误'
        });
      }
    }, 1000); // 模拟网络延迟
  });
}; 