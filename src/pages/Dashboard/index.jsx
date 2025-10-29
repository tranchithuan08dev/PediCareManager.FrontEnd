import React, { useState } from 'react';
import { 
    Layout, Menu, Typography, Button, Space, theme, Avatar, Dropdown, message 
} from 'antd';
import { 
    MenuFoldOutlined, MenuUnfoldOutlined, 
    HomeOutlined, UserSwitchOutlined, SolutionOutlined, 
    ScheduleOutlined, MedicineBoxOutlined, LogoutOutlined, 
    UserOutlined, BarChartOutlined, SettingOutlined // Icon mới
} from '@ant-design/icons';
// ⭐️ Sử dụng Outlet từ react-router-dom để hiển thị nội dung trang con
// Lưu ý: Bạn cần cài đặt và thiết lập React Router cho ứng dụng của mình.
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

// --- Dữ liệu Menu Điều hướng (Cập nhật nếu cần) ---
const menuItems = [
    {
        key: 'dashboard',
        icon: <HomeOutlined />,
        label: 'Tổng quan',
        path: '/admin/exam',
    },
    {
        key: 'examination',
        icon: <SolutionOutlined />,
        label: 'Khám Bệnh (Hồ sơ)',
        path: '/admin/exam',
    },
    {
        key: 'appointments',
        icon: <ScheduleOutlined />,
        label: 'Quản lý bệnh nhân',
        path: '/admin/patient',
    },
    {
        key: 'inventory',
        icon: <MedicineBoxOutlined />,
        label: 'Kho Thuốc',
        path: '/admin/medicine',
    },
    {
        key: 'reports',
        icon: <BarChartOutlined />,
        label: 'Báo cáo & Thống kê',
        path: '/reports',
    },
];

// --- Thông tin Bác sĩ Giả định ---
const doctorInfo = {
    fullName: "BS. Nguyễn Văn A",
    role: "Bác sĩ Nhi Khoa",
};

// --- Dropdown Menu cho Profile ---
const profileMenu = (onLogout) => (
    <Menu
        onClick={({ key }) => {
            if (key === 'logout') {
                onLogout();
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
            {
                key: 'settings',
                icon: <SettingOutlined />,
                label: 'Thiết lập hệ thống',
            },
            {
                type: 'divider',
            },
            {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: 'Đăng xuất',
                danger: true,
            },
        ]}
    />
);


// --- Component Chính: Dashboard Layout ---
const DoctorDashboardLayout = () => {
    const [collapsed, setCollapsed] = useState(false); // Trạng thái ẩn/hiện Sider
    const navigate = useNavigate(); // Hook chuyển hướng
    const location = useLocation(); // Hook lấy vị trí hiện tại

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    // ⭐️ Xử lý Đăng xuất
    const handleLogout = () => {
        message.success("Đăng xuất thành công. Hẹn gặp lại!");
        // TODO: Xóa token/session và chuyển về trang login
        navigate('/'); 
    };
    
    // ⭐️ Xử lý Menu Click
    const handleMenuClick = ({ key }) => {
        const selectedItem = menuItems.find(item => item.key === key);
        if (selectedItem && selectedItem.path) {
            navigate(selectedItem.path);
        }
    };
    
    // ⭐️ Logic xác định key menu đang active dựa trên URL
    const activeKey = menuItems.find(item => location.pathname.startsWith(item.path))?.key || 'dashboard';


    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* 1. SIDER (Menu bên trái) */}
            <Sider 
                trigger={null} 
                collapsible 
                collapsed={collapsed}
                width={250} // Chiều rộng menu khi mở
                collapsedWidth={80} // Chiều rộng menu khi đóng
                style={{ 
                    overflow: 'auto', // Đảm bảo scroll nếu menu dài
                    height: '100vh', 
                    position: 'fixed', 
                    left: 0, 
                    top: 0, 
                    bottom: 0,
                    zIndex: 100, // Đảm bảo Sider nằm trên các nội dung khác
                }}
            >
                {/* Logo/Tên Hệ thống */}
                <div 
                    style={{ 
                        height: 32, 
                        margin: 16, 
                        textAlign: 'center', 
                        // Màu chữ sáng hơn, phù hợp với nền tối Sider
                        color: 'white' 
                    }}
                >
                    <UserSwitchOutlined style={{ marginRight: collapsed ? 0 : 8 }} />
                    {!collapsed && "Nhi Khoa CMS"}
                </div>
                
                {/* Menu Điều hướng */}
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[activeKey]} // Highlight mục đang hoạt động
                    items={menuItems}
                    onClick={handleMenuClick}
                />
            </Sider>
            
            <Layout 
                // Điều chỉnh margin-left của Content/Header khi Sider đóng/mở
                style={{ marginLeft: collapsed ? 80 : 250, transition: 'margin 0.2s' }}
            >
                {/* 2. HEADER (Thanh tiêu đề trên) */}
                <Header 
                    style={{ 
                        padding: 0, 
                        background: colorBgContainer, 
                        position: 'sticky', 
                        top: 0, 
                        zIndex: 99, // Đảm bảo Header nằm trên Content
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {/* Nút Toggle Menu */}
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
                        
                        {/* Thông tin Bác sĩ và Đăng xuất */}
                        <Space size="large" style={{ paddingRight: 24 }}>
                            <Title level={5} style={{ margin: 0 }}>
                                Xin chào, {doctorInfo.fullName}
                            </Title>
                            <Dropdown overlay={() => profileMenu(handleLogout)} trigger={['click']}>
                                <Avatar 
                                    size="large" 
                                    icon={<UserOutlined />} 
                                    style={{ cursor: 'pointer' }}
                                />
                            </Dropdown>
                        </Space>
                    </div>
                </Header>
                
                {/* 3. CONTENT (Nội dung chính) */}
                <Content
                    style={{
                        margin: '16px', // Khoảng cách giữa Header/Sider và nội dung
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                        // Thẻ Content này sẽ chứa nội dung của các trang con
                    }}
                >
                    {/* ⭐️ OUTLET: Nơi các component con được render */}
                    <Outlet /> 
                    
                </Content>
            </Layout>
        </Layout>
    );
};

export default DoctorDashboardLayout;