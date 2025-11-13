// File: components/AdminDashboard.jsx
import React, { useState, useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  message,
  Space,
  Typography,
} from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  BarChartOutlined,
  SettingOutlined,
  HomeOutlined,
  SolutionOutlined,
  PlusCircleOutlined,
  LogoutOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const menuItems = [
  {
    key: 'dashboard',
    icon: <DashboardOutlined />,
    label: 'Dashboard Chính',
    path: '/admin/monthly-transaction-report',
  },
  {
    key: 'medicine',
    icon: <ShoppingCartOutlined />,
    label: 'Quản lý Thuốc',
    path: '/admin/medicine',
  },
  {
    key: 'patient',
    icon: <UserOutlined />,
    label: 'Quản lý Bệnh nhân',
    path: '/admin/patient',
  },
  {
    key: 'revenue-reports',
    icon: <BarChartOutlined />,
    label: 'Báo cáo Doanh thu',
    path: '/admin/reports',
  },
  {
    key: 'create-medicine',
    icon: <PlusCircleOutlined />,
    label: 'Tạo thuốc',
    path: '/admin/create-medicine',
  },
  {
    key: 'doctor-profile',
    icon: <HomeOutlined />,
    label: 'Hồ sơ Bác sĩ',
    path: '/admin/doctor-profile',
  },
  {
    key: 'attendance-reports',
    icon: <SolutionOutlined />,
    label: 'Kiểm tra Ca làm',
    path: '/admin/attendance-reports',
  },
];

export default function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggle = () => setCollapsed(!collapsed);

  const selectedKey = useMemo(() => {
    const currentItem = menuItems.find(item => location.pathname.startsWith(item.path));
    return currentItem ? currentItem.key : 'dashboard';
  }, [location.pathname]);

  const handleMenuClick = ({ key }) => {
    const item = menuItems.find(i => i.key === key);
    if (item?.path) navigate(item.path);
  };

  // ✅ Xử lý Logout
  const handleLogout = () => {
    localStorage.removeItem('ACCESS_TOKEN');
    message.success('Đăng xuất thành công. Hẹn gặp lại!');
    navigate('/');
  };

  // ✅ Dropdown Menu Profile
  const profileMenu = (
    <Menu
      items={[
        {
          key: 'profile',
          icon: <UserOutlined />,
          label: 'Hồ sơ cá nhân',
          onClick: () => navigate('/admin/doctor-profile'),
        },
        {
          type: 'divider',
        },
        {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: 'Đăng xuất',
          danger: true,
          onClick: handleLogout,
        },
      ]}
    />
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* --- SIDEBAR --- */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          background: 'linear-gradient(180deg, #090822ff 0%, #282953ff 100%)',
        }}
      >
        <div
          style={{
            height: 64,
            margin: 16,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: 18,
            background: 'rgba(255, 255, 255, 0.2)',
          }}
        >
          {collapsed ? 'AD' : 'Admin Dashboard'}
        </div>

        <Menu
          theme="light"
          mode="inline"
          items={menuItems}
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          style={{
            background: 'transparent',
            color: 'white',
            fontWeight: 500,
          }}
        />

        <style>
          {`
            .ant-menu-light .ant-menu-item-selected {
              background-color: rgba(255,255,255,0.2) !important;
              border-radius: 8px;
              font-weight: 600;
              color: white !important;
            }
            .ant-menu-light .ant-menu-item:hover {
              background-color: rgba(255,255,255,0.15) !important;
              color: white !important;
            }
            .ant-menu-item {
              color: white !important;
            }
          `}
        </style>
      </Sider>

      {/* --- MAIN AREA --- */}
      <Layout>
        <Header
          style={{
            padding: '0 16px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* --- LEFT: Toggle & Title --- */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button
              type="text"
              onClick={toggle}
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              style={{ fontSize: 16 }}
            />
            <Title level={5} style={{ margin: 0, color: '#333' }}>
              Bảng điều khiển quản trị
            </Title>
          </div>

          {/* --- RIGHT: Avatar + Dropdown Logout --- */}
          <Space size="large">
            <Dropdown overlay={profileMenu} trigger={['click']}>
              <Avatar
                size="large"
                icon={<UserOutlined />}
                style={{ backgroundColor: '#0664abff', cursor: 'pointer' }}
              />
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            margin: '16px',
            background: '#fff',
            padding: 16,
            borderRadius: 8,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
