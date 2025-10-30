import React, { useState } from 'react'; 
import { 
    Card, 
    Typography, 
    Descriptions, 
    Space, 
    Avatar, 
    Tag, 
    Button,
    Modal, 
    Form,
    Input, 
    message // Giữ lại import này
} from 'antd';
import { 
    UserOutlined, 
    MailOutlined, 
    PhoneOutlined, 
    IdcardOutlined, 
    EditOutlined, 
    KeyOutlined, 
    SolutionOutlined 
} from '@ant-design/icons';
import 'antd/dist/reset.css'; 
import { useDispatch, useSelector } from 'react-redux';
import { fetchChangePassword } from '../../store/authSlice';

const { Title, Text } = Typography;

const ChangePasswordModal = ({ visible, onCancel, doctorData, apiMessage }) => {
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    
    const handleFinish = (values) => {
        const payload = {
            email: doctorData.email,
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
        };

        apiMessage.loading({ content: 'Đang gửi yêu cầu...', key: 'updKey' });

        dispatch(fetchChangePassword(payload))
            .then((res) => {
                if (res.meta.requestStatus === "fulfilled") {
                    apiMessage.success({
                        content: 'Đổi mật khẩu thành công!',
                        key: 'updKey',
                        duration: 2,
                    });
                    onCancel();
                    form.resetFields();
                } else {
                    apiMessage.error({
                        content: res.payload?.message || "Đổi mật khẩu thất bại!", 
                        key: 'updKey',
                        duration: 3,
                    });
                }
            })
            .catch((error) => {
                apiMessage.error({ 
                    content: `Lỗi hệ thống: ${error.message || 'Vui lòng thử lại!'}`,
                    key: 'updKey',
                });
            });
    };

    return (
        <Modal
            title={<Title level={4}><KeyOutlined /> Đổi Mật Khẩu</Title>}
            open={visible}
            onCancel={onCancel}
            footer={null} 
            destroyOnClose={true} 
            width={450}
        > 
            <Form
                form={form}
                layout="vertical"
                name="change_password_form"
                onFinish={handleFinish}
            >
                <Form.Item label="Email Đăng Nhập">
                    <Input value={doctorData.email} disabled prefix={<MailOutlined />} />
                </Form.Item>
                
                <Form.Item
                    name="currentPassword"
                    label="Mật khẩu Hiện tại"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
                >
                    <Input.Password prefix={<KeyOutlined />} placeholder="Nhập mật khẩu hiện tại" />
                </Form.Item>

                <Form.Item
                    name="newPassword"
                    label="Mật khẩu Mới"
                    rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                        { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự.' }
                    ]}
                    hasFeedback 
                >
                    <Input.Password prefix={<KeyOutlined />} placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)" />
                </Form.Item>
                
                <Form.Item
                    name="confirm"
                    label="Xác nhận Mật khẩu Mới"
                    dependencies={['newPassword']}
                    hasFeedback
                    rules={[
                        { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
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
                    <Input.Password prefix={<KeyOutlined />} placeholder="Nhập lại mật khẩu mới" />
                </Form.Item>

                {/* Nút Submit */}
                <Form.Item style={{ textAlign: 'right', marginTop: 20, marginBottom: 0 }}>
                    <Space>
                        <Button onClick={onCancel}>Hủy</Button>
                        <Button type="primary" htmlType="submit">
                            Đổi Mật Khẩu
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};


const DoctorProfile = () => {
    const [apiMessage, contextHolder] = message.useMessage();
    
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);

    const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
    
    const rawDoctorData = useSelector((state)=> state?.AUTH?.currentuser) || {}; 
    
    const doctorData = Object.keys(rawDoctorData).length === 0 ? 
        { 
            "id": 3,
            "fullName": "Trần CHÍ THUẠN",
            "email": "thuantcse184519@fpt.edu.vn",
            "role": "doctor",
            "phone": "0372342060",
            "specialty": "Nội khoa" 
        } : 
        { ...rawDoctorData, specialty: rawDoctorData.specialty || 'Nội khoa' };

    if (!doctorData || !doctorData.fullName) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải dữ liệu hồ sơ...</div>;
    }

    const getRoleColor = (role) => {
        switch(role) {
            case 'doctor': return 'blue';
            case 'admin': return 'volcano';
            default: return 'green';
        }
    }

    return (
        <div style={{ padding: '40px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            {contextHolder}
            
            <Title level={2} style={{ textAlign: 'center', marginBottom: 30 }}>
                <IdcardOutlined /> Hồ Sơ Cá Nhân
            </Title>

            <Card 
                style={{ maxWidth: 700, margin: '0 auto', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}
                title={
                    <Space size="middle" align="center">
                        <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                        <div>
                            <Title level={4} style={{ marginBottom: 0 }}>{doctorData.fullName}</Title>
                            <Tag color={getRoleColor(doctorData.role)} style={{ marginTop: 4 }}>
                                <IdcardOutlined /> {capitalize(doctorData.role)}
                            </Tag>
                        </div>
                    </Space>
                }
            >
                <Descriptions 
                    bordered 
                    column={1} 
                    size="middle" 
                    layout="horizontal"
                    style={{ marginTop: 20 }}
                >
                    <Descriptions.Item label={<Text strong><IdcardOutlined /> Mã ID</Text>}>
                        <Tag color="processing">{doctorData.id}</Tag>
                    </Descriptions.Item>
                    
                    <Descriptions.Item label={<Text strong><MailOutlined /> Email</Text>}>
                        <Text copyable>{doctorData.email}</Text>
                    </Descriptions.Item>
                    
                    <Descriptions.Item label={<Text strong><PhoneOutlined /> Điện Thoại</Text>}>
                        <Text copyable>{doctorData.phone}</Text>
                    </Descriptions.Item>
                    
                    <Descriptions.Item label={<Text strong><SolutionOutlined /> Chuyên Khoa</Text>}>
                        <Text>{doctorData.specialty || 'Nội khoa'}</Text>
                    </Descriptions.Item>
                    
                </Descriptions>

                <div style={{ marginTop: 30, textAlign: 'right' }}>
                    <Space size="middle">
                        <Button 
                            type="primary" 
                            icon={<KeyOutlined />} 
                            onClick={() => setIsPasswordModalVisible(true)}
                        >
                            Đổi Mật Khẩu
                        </Button>
                       
                    </Space>
                </div>
            </Card>
            
            <ChangePasswordModal 
                visible={isPasswordModalVisible}
                onCancel={() => setIsPasswordModalVisible(false)}
                doctorData={doctorData} 
                apiMessage={apiMessage} 
            />
        </div>
    );
};

export default DoctorProfile;