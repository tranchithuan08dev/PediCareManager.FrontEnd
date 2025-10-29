import React, { useEffect, useState } from 'react';
import { 
    Layout, Card, Form, Input, Button, Typography, Steps, message, Space 
} from 'antd';
import { 
    MailOutlined, LockOutlined, CheckCircleOutlined, SolutionOutlined, RightOutlined, 
    LeftOutlined
} from '@ant-design/icons';
import 'antd/dist/reset.css';
import { useDispatch, useSelector } from 'react-redux';
import { fetchResetPassword, fetchSendEmail } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;
const { Title, Text } = Typography;



// API 2: Nhập OTP và cập nhật mật khẩu mới
const callResetPasswordApi = async (data) => {
    const { email, otp, newPassword } = data;
    // Giả lập API gọi thành công sau 1 giây
    return new Promise(resolve => {
        setTimeout(() => {
            console.log(`[API 2] Đặt lại mật khẩu cho: ${email}, OTP: ${otp}, Mật khẩu mới: ${newPassword}`);
            resolve({ success: true });
        }, 1000);
    });
};


// --- Component Quên Mật Khẩu (3 Bước) ---
const ForgetPasswordPage = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const dispatch = useDispatch()

              
    const accentColor = '#1890ff';

    // ⭐️ Style để căn giữa Card trên màn hình
    const containerStyle = {
        minHeight: '100vh', 
          backgroundImage: 'url("https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg")',
        backgroundSize: 'cover',   
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '20px',
    };

    const cardStyle = {
        width: '500px', // Rộng hơn một chút để chứa Steps
        maxWidth: '95%',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
        marginTop: '70px'
    };
     const [messageApi, contextHolder] = message.useMessage();
    // --- BƯỚC 1: Gửi Email ---
    const Step1 = () => {
        const onFinishStep1 = async (values) => {

        
            setLoading(true);
           try {
                await dispatch(fetchSendEmail( values));

              
                    setEmail(values.email);
                    messageApi.open({
                        type: 'success',
                        content: `Mã xác nhận (OTP) đã được gửi đến: ${values.email}.`,
                        });

                  
                    setCurrentStep(1);
               
                } catch (error) {
                       messageApi.open({
                            type: 'error',
                            content: 'Lỗi kiểm tra lại email!!!',
                            });
                } finally {
                setLoading(false);
                }
            setLoading(false);
        };

        return (
            <Form
                form={form}
                name="step1_form"
                onFinish={onFinishStep1}
                layout="vertical"
            >
                <Text type="secondary" style={{ marginBottom: 15, display: 'block' }}>
                    Vui lòng nhập email đã đăng ký để nhận mã xác nhận (OTP) qua email.
                </Text>

                <Form.Item
                    label="Email của bạn"
                    name="email"
                    rules={[
                        { required: true, message: 'Vui lòng nhập email!' },
                        { type: 'email', message: 'Email không hợp lệ!' }
                    ]}
                >
                    <Input 
                        prefix={<MailOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} 
                        placeholder="example@clinic.com" 
                        size="large"
                    />
                </Form.Item>
                
                <Form.Item style={{ marginTop: 30 }}>
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        size="large"
                        loading={loading}
                        style={{ width: '100%', borderRadius: '4px', height: '45px' }}
                    >
                        GỬI MÃ XÁC NHẬN <RightOutlined />
                    </Button>
                </Form.Item>
            </Form>
        );
    };

    // --- BƯỚC 2: Nhập OTP và Mật khẩu mới ---
    const Step2 = () => {
        const onFinishStep2 = async (values) => {
        
        console.log(values);
        const data = {
            email : email,
            newPassword: values.newPassword,
            otp: values.otp
        }
       
            setLoading(true);
            try {
              dispatch(fetchResetPassword(data)).then((res) => {
                   if (res.payload) {
                     messageApi.success('Đăng nhập thành công!');
                       setCurrentStep(2); 
                   } else {
                     messageApi.error('Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản hoặc mật khẩu.');
                   }
                 });
            
                
            } catch (error) {
                message.error('Đã xảy ra lỗi. Vui lòng kiểm tra lại thông tin.');
            }
            setLoading(false);
        };

        return (
            <Form
                form={form}
                name="step2_form"
                onFinish={onFinishStep2}
                layout="vertical"
            >
                <Text type="secondary" style={{ marginBottom: 15, display: 'block' }}>
                    Nhập mã xác nhận đã được gửi đến **{email}** và mật khẩu mới của bạn.
                </Text>

                <Form.Item
                    label="Mã Xác Nhận (OTP)"
                    name="otp"
                    rules={[{ required: true, message: 'Vui lòng nhập mã OTP!' }]}
                >
                    <Input 
                        prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} 
                        placeholder="Nhập mã 6 chữ số" 
                        size="large"
                        maxLength={6}
                    />
                </Form.Item>

                <Form.Item
                    label="Mật Khẩu Mới"
                    name="newPassword"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!', min: 6 }]}
                >
                    <Input.Password
                        prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                        placeholder="Mật khẩu mới (ít nhất 6 ký tự)"
                        size="large"
                    />
                </Form.Item>
                
                <Form.Item
                    label="Xác Nhận Mật Khẩu"
                    name="confirmPassword"
                    dependencies={['newPassword']}
                    hasFeedback
                    rules={[
                        { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('newPassword') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Hai mật khẩu đã nhập không khớp!'));
                            },
                        }),
                    ]}
                >
                    <Input.Password
                        prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                        placeholder="Xác nhận mật khẩu mới"
                        size="large"
                    />
                </Form.Item>

                <Space style={{ width: '100%', justifyContent: 'space-between', marginTop: 10 }}>
                    <Button onClick={() => setCurrentStep(0)} type="default">
                        <LeftOutlined /> Quay lại & Đổi Email
                    </Button>
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        size="large"
                        loading={loading}
                        style={{ width: '100%', borderRadius: '4px' }}
                    >
                        ĐẶT LẠI MẬT KHẨU
                    </Button>
                </Space>
            </Form>
        );
    };

    // --- BƯỚC 3: Hoàn tất ---
   const Step3 = () => {
    const navigate = useNavigate();
    const handleGoToLogin = () => {
    navigate('/'); 
  };
  return (
    <div style={{ textAlign: 'center', padding: '50px 0' }}>
      <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a', marginBottom: 20 }} />
      <Title level={3}>Thành Công!</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 30 }}>
        Mật khẩu của bạn đã được cập nhật. Bạn có thể sử dụng mật khẩu mới để đăng nhập.
      </Text>
      <Button 
        type="primary" 
        size="large" 
       onClick={handleGoToLogin}
      >
        Về Trang Đăng Nhập
      </Button>
    </div>
  );
};

    
    // --- Render nội dung bước hiện tại ---
    const stepsContent = [
        <Step1 />,
        <Step2 />,
        <Step3 />
    ];

    const stepsItems = [
        { title: 'Nhập Email' },
        { title: 'Nhập Mã OTP' },
        { title: 'Hoàn tất' },
    ];

    return (
        <Layout style={containerStyle}>
            {contextHolder}
            <Content>
                <Card style={cardStyle} bordered={false}>
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <SolutionOutlined style={{ fontSize: '36px', color: accentColor }} />
                        <Title level={3} style={{ margin: '10px 0 20px 0' }}>
                            QUÊN MẬT KHẨU
                        </Title>
                    </div>

                    {/* Thanh Steps (Tiến trình) */}
                    <Steps 
                        current={currentStep} 
                        items={stepsItems} 
                        style={{ marginBottom: 40 }} 
                        // Chỉ cho phép click nếu đã hoàn thành bước đó (ví dụ: quay lại Bước 1)
                        onChange={(value) => { if (value < currentStep) setCurrentStep(value); }}
                    />
                    
                    {/* Nội dung Form của từng bước */}
                    <div style={{ padding: '0 20px 20px' }}>
                        {stepsContent[currentStep]}
                    </div>
                </Card>
            </Content>
        </Layout>
    );
};

export default ForgetPasswordPage;