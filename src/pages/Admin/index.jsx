// File: components/AdminDashboard.jsx (Đã cập nhật & Tích hợp Router)
import React, { useState, useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom'; // 🚀 Thêm useMemo, useNavigate, useLocation
import {
  Layout,
  Menu,
  Breadcrumb,
  Button,
  Input,
} from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  BarChartOutlined,
  SettingOutlined,
  SearchOutlined,
  // 🚀 Icon mới bạn muốn dùng
  HomeOutlined, 
  SolutionOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const menuItems = [
    {
        key: 'dashboard',
        icon: <DashboardOutlined />, 
        label: 'Dashboard Chính',
        path: '/dashboard', 
    },
    {
        key: 'users',
        icon: <ShoppingCartOutlined />,
        label: 'Quản lý Thuốc',
        path: '/admin/medicine',
    },
    {
        key: 'orders',
        icon: <UserOutlined />,
        label: 'Quản lý khách hàng',
        path: '/admin/patient',
    },
    {
        key: 'reports',
        icon: <BarChartOutlined />,
        label: 'Báo cáo doanh thu',
        path: '/admin/reports',
    },
    {
        key: 'settings',
        icon: <SettingOutlined />,
        label: 'Báo cáo giao dịch',
        path: '/admin/monthly-transaction-report',
    },
   
    {
        key: 'doctor-profile',
        icon: <HomeOutlined />,
        label: 'Hồ sơ Bác sĩ',
        path: '/admin/doctor-profile',
    },
    {
        key: 'examination',
        icon: <SolutionOutlined />,
        label: 'Khám Bệnh (Hồ sơ) (Mục mới 2)',
        path: '/admin/examination',
    },
];

export default function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  
  // 2. Tích hợp Router Hooks
  const navigate = useNavigate();
  const location = useLocation();

  const toggle = () => setCollapsed(!collapsed);

  // 3. Logic xác định key đang được chọn (Tối ưu bằng useMemo)
  const selectedKey = useMemo(() => {
      // Tìm item có path khớp với đường dẫn hiện tại
      // Ví dụ: nếu location.pathname là '/admin/users/detail/1', nó sẽ khớp với '/admin/users'
      const currentItem = menuItems.find(item => location.pathname.startsWith(item.path));
        
      // Mặc định là 'dashboard' nếu không tìm thấy
      return currentItem ? currentItem.key : 'dashboard';
  }, [location.pathname]);

  // 4. Xử lý khi click vào Menu để điều hướng
  const handleMenuClick = ({ key }) => {
      const item = menuItems.find(i => i.key === key);
      if (item?.path) {
          navigate(item.path);
      }
  };


  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div
          style={{
            height: 64,
            margin: 16,
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
          }}
        >
          {collapsed ? 'AD' : 'Admin Dashboard'}
        </div>
        
        {/* 🚀 Sử dụng dữ liệu menuItems, selectedKey, và handleMenuClick */}
        <Menu 
          theme="dark" 
          mode="inline" 
          items={menuItems}
          selectedKeys={[selectedKey]} 
          onClick={handleMenuClick}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: '0 16px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button
              type="text"
              onClick={toggle}
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            />
           {/* Bạn có thể thêm Breadcrumb hoặc tiêu đề ở đây */}
          </div>
        </Header>

        <Content style={{ margin: '16px', background: '#fff', padding: 16, borderRadius: 8 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}