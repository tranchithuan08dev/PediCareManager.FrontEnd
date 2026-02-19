import React, { useState } from 'react';
import { 
    Layout, Menu, Typography, Button, Space, theme, Avatar, Dropdown, message 
} from 'antd';
import { 
    MenuFoldOutlined, MenuUnfoldOutlined, 
    HomeOutlined, UserSwitchOutlined, SolutionOutlined, 
    ScheduleOutlined, MedicineBoxOutlined, LogoutOutlined, 
    UserOutlined, BarChartOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const menuItems = [
    {
        key: 'dashboard',
        icon: <HomeOutlined />,
        label: 'Tổng quan',
        path: '/dashboard/doctor-profile',
    },
    {
        key: 'examination',
        icon: <SolutionOutlined />,
        label: 'Khám bệnh (Hồ sơ)',
        path: '/dashboard/examination',
    },
    {
        key: 'appointments',
        icon: <ScheduleOutlined />,
        label: 'Quản lý bệnh nhân',
        path: '/dashboard/patient',
    },
    {
        key: 'inventory',
        icon: <MedicineBoxOutlined />,
        label: 'Kho thuốc',
        path: '/dashboard/medicine',
    },
    {
        key: 'reports',
        icon: <BarChartOutlined />,
        label: 'Chấm công',
        path: '/dashboard/attendance-widget',
    },
];

const profileMenu = (onLogout, navigate) => (
    <Menu
        onClick={({ key }) => {
            if (key === 'logout') {
                onLogout();
            } else if (key === 'profile') {
                navigate('/dashboard/doctor-profile');
            } else {
                message.info(`Chức năng ${key} đang được phát triển.`);
            }
        }}
        items={[
            {
                key: 'profile',
                icon: <UserOutlined />,
                label: 'Hồ sơ cá nhân',
            },
            { type: 'divider' },
            {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: 'Đăng xuất',
                danger: true,
            },
        ]}
    />
);

const DoctorDashboardLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const currentUser = useSelector((state)=> state?.AUTH?.currentuser) || {}; 
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const handleLogout = () => {
        localStorage.removeItem('ACCESS_TOKEN');
        message.success("Đăng xuất thành công. Hẹn gặp lại!");
        navigate('/');
    };
    
    const handleMenuClick = ({ key }) => {
        const selectedItem = menuItems.find(item => item.key === key);
        if (selectedItem?.path) navigate(selectedItem.path);
    };
    
    const activeKey = menuItems.find(item => location.pathname.startsWith(item.path))?.key || 'dashboard';

    return (
        <Layout style={{ minHeight: '100vh', backgroundColor: '#f4f9f8' }}>
            {/* --- SIDEBAR --- */}
            <Sider 
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={250}
                collapsedWidth={80}
                style={{
                    overflow: 'auto',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 100,
                   background: 'linear-gradient(180deg, #090822ff 0%, #282953ff 100%)',
                    boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
                }}
            >
                <div
                    style={{
                        height: 64,
                        margin: 16,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        color: 'white',
                        fontSize: 18,
                        fontWeight: 600,
                        letterSpacing: 0.5,
                    }}
                >
                    <UserSwitchOutlined style={{ marginRight: collapsed ? 0 : 8, fontSize: 22 }} />
                    {!collapsed && "Phòng Khám Nhi Khoa"}
                </div>

                <Menu
                    mode="inline"
                    theme="light"
                    selectedKeys={[activeKey]}
                    onClick={handleMenuClick}
                    items={menuItems}
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
                        }
                        .ant-menu-light .ant-menu-item:hover {
                            background-color: rgba(255,255,255,0.15) !important;
                        }
                        .ant-menu-item {
                            color: white !important;
                        }
                    `}
                </style>
            </Sider>

            {/* --- MAIN LAYOUT --- */}
            <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'margin 0.3s ease' }}>
                <Header 
                    style={{ 
                        padding: 0,
                        background: '#ffffff',
                        position: 'sticky',
                        top: 0,
                        zIndex: 99,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{
                                fontSize: '16px',
                                width: 64,
                                height: 64,
                            }}
                        />
                        <Space size="large" style={{ paddingRight: 24 }}>
                            <Title level={5} style={{ margin: 0, color: '#333' }}>
                                Xin chào, {currentUser.fullName || 'Bác sĩ'}
                            </Title>
                            <Dropdown overlay={() => profileMenu(handleLogout, navigate)} trigger={['click']}>
                                <Avatar 
                                    size="large"
                                    icon={<UserOutlined />}
                                    style={{ backgroundColor: '#1d2b2aff', cursor: 'pointer' }}
                                />
                            </Dropdown>
                        </Space>
                    </div>
                </Header>

                <Content
                    style={{
                        margin: '16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default DoctorDashboardLayout;
