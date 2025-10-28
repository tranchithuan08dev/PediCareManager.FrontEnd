import React from 'react';
import { 
    Layout, Card, Form, Input, Button, Typography, message 
} from 'antd';
import { 
    UserOutlined, LockOutlined, GlobalOutlined, SolutionOutlined 
} from '@ant-design/icons';
import 'antd/dist/reset.css'; 
import { useDispatch } from 'react-redux';
import { fetchLogin } from '../store/authSlice';

const { Content } = Layout;
const { Title, Text } = Typography;



const LoginPage = () => {
    const dispatch = useDispatch();
const [messageApi, contextHolder] = message.useMessage();

  const onFinish = (values) => {
    dispatch(fetchLogin(values)).then((res) => {
      if (res.payload.ok) {
        messageApi.success('Đăng nhập thành công!');
      } else {
        messageApi.error('Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản hoặc mật khẩu.');
      }
    });
  };
    
    // ⭐️ CONTAINER STYLE: Đảm bảo căn giữa tuyệt đối
    const containerStyle = {
        minHeight: '100vh', 
        // Background gradient màu xanh dương nhẹ nhàng
       backgroundImage: 'url("https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg")',
        backgroundSize: 'cover',      // ảnh phủ kín toàn màn hình
     // căn giữa ảnh
        backgroundRepeat: 'no-repeat',
        
        // CĂN GIỮA NỘI DUNG THEO CHIỀU NGANG VÀ DỌC
        display: 'flex',
        justifyContent: 'center', 
        alignItems: 'center', 
        
        padding: '20px', // Đảm bảo có khoảng đệm nếu màn hình quá nhỏ
    };

    const cardStyle = {
        width: '400px',
        maxWidth: '90%',
        borderRadius: '16px', 
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        marginTop: '70px'
    };

    const headerStyle = {
        textAlign: 'center',
        padding: '20px 0 0',
    };

    const accentColor = '#1890ff'; 

    return (
        <Layout style={containerStyle}>
             {contextHolder}
            {/* Thẻ Content đã được flexbox của Layout căn giữa */}
            <Content> 
                <Card style={cardStyle} bordered={false}>
                    {/* Phần Đầu Trang/Banner */}
                    <div style={headerStyle}>
                        <SolutionOutlined 
                            style={{ fontSize: '48px', color: accentColor }} 
                        />
                        <Title level={2} style={{ margin: '10px 0 5px 0', color: '#001529' }}>
                            Phần Mềm Quản Lý
                        </Title>
                        <Title level={4} style={{ margin: '0 0 5px 0', color: accentColor }}>
                            Nhi Khoa
                        </Title>
                        <Text type="secondary" style={{ display: 'block', marginBottom: '20px' }}>
                            Đăng nhập để tiếp tục công việc khám bệnh.
                        </Text>
                    </div>

                    {/* Form Đăng Nhập */}
                    <Form
                        name="login_form"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        layout="vertical"
                        style={{ padding: '0 40px 40px' }}
                    >
                        <Form.Item
                            label="Tên Đăng Nhập"
                            name="username"
                            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
                        >
                            <Input 
                                placeholder="Tài khoản của bạn" 
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Mật Khẩu"
                            name="password"
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                        >
                            <Input.Password
                                placeholder="Mật khẩu"
                                size="large"
                            />
                        </Form.Item>

                        {/* Button Đăng Nhập */}
                        <Form.Item style={{ marginTop: '30px', marginBottom: '10px' }}>
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                size="large"
                                style={{ width: '100%', borderRadius: '4px', height: '45px' }}
                            >
                                ĐĂNG NHẬP
                            </Button>
                        </Form.Item>
                        
                        {/* Footer nhỏ */}
                        <div style={{ textAlign: 'center', marginTop: '10px' }}>
                            <Text type="secondary" style={{ fontSize: '0.8em' }}>
                                <GlobalOutlined style={{ marginRight: 4 }}/> Hệ thống quản lý y tế v1.0
                            </Text>
                        </div>
                    </Form>
                </Card>
            </Content>
        </Layout>
    );
};

export default LoginPage;