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
  message,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  KeyOutlined,
  SolutionOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChangePassword } from '../../store/authSlice';
import 'antd/dist/reset.css';

const { Title, Text } = Typography;

// Modal đổi mật khẩu
const ChangePasswordModal = ({ visible, onCancel, doctorData, apiMessage }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    const payload = {
      email: doctorData.email,
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    };

    apiMessage.loading({ content: 'Đang xử lý...', key: 'updKey' });

    dispatch(fetchChangePassword(payload))
      .then((res) => {
        if (res.meta.requestStatus === 'fulfilled') {
          apiMessage.success({
            content: 'Đổi mật khẩu thành công!',
            key: 'updKey',
            duration: 2,
          });
          onCancel();
          form.resetFields();
        } else {
          apiMessage.error({
            content: res.payload?.message || 'Đổi mật khẩu thất bại!',
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
      title={
        <Title level={4} style={{ marginBottom: 0 }}>
          <KeyOutlined /> Đổi Mật Khẩu
        </Title>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
      centered
      width={480}
    >
      <Form
        form={form}
        layout="vertical"
        name="change_password_form"
        onFinish={handleFinish}
      >
        <Form.Item label="Email Đăng Nhập">
          <Input
            value={doctorData.email}
            disabled
            prefix={<MailOutlined />}
            style={{ backgroundColor: '#fafafa' }}
          />
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
            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự.' },
          ]}
          hasFeedback
        >
          <Input.Password prefix={<KeyOutlined />} placeholder="Nhập mật khẩu mới (≥6 ký tự)" />
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
                if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                return Promise.reject(new Error('Hai mật khẩu không khớp!'));
              },
            }),
          ]}
        >
          <Input.Password prefix={<KeyOutlined />} placeholder="Nhập lại mật khẩu mới" />
        </Form.Item>

        <Form.Item style={{ textAlign: 'right', marginTop: 20 }}>
          <Space>
            <Button onClick={onCancel}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              style={{
                background: 'linear-gradient(135deg, #1677ff, #4096ff)',
                border: 'none',
              }}
            >
              Xác nhận
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

// Component hồ sơ bác sĩ
const DoctorProfile = () => {
  const [apiMessage, contextHolder] = message.useMessage();
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const rawDoctorData = useSelector((state) => state?.AUTH?.currentuser) || {};

  const doctorData =
    Object.keys(rawDoctorData).length === 0
      ? {
          id: 3,
          fullName: 'Trần Chí Thuận',
          email: 'thuantcse184519@fpt.edu.vn',
          role: 'doctor',
          phone: '0372342060',
          specialty: 'Nội khoa',
        }
      : { ...rawDoctorData, specialty: rawDoctorData.specialty || 'Nội khoa' };

  if (!doctorData || !doctorData.fullName) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        Đang tải dữ liệu hồ sơ...
      </div>
    );
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'doctor':
        return 'blue';
      case 'admin':
        return 'volcano';
      default:
        return 'green';
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #e6f0ff, #f9fbff)',
        padding: '60px 20px',
      }}
    >
      {contextHolder}

      <Card
        bordered={false}
        style={{
          maxWidth: 800,
          margin: '0 auto',
          borderRadius: 20,
          boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
          background: '#fff',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <Avatar
            size={100}
            icon={<UserOutlined />}
            style={{ backgroundColor: '#1677ff' }}
          />
          <Title level={3} style={{ marginTop: 15 }}>
            {doctorData.fullName}
          </Title>
          <Tag color={getRoleColor(doctorData.role)} style={{ fontSize: 14 }}>
            <IdcardOutlined /> {capitalize(doctorData.role)}
          </Tag>
        </div>

        <Descriptions
          bordered
          column={1}
          size="middle"
          labelStyle={{ width: 180, fontWeight: 600 }}
          style={{ background: '#fafafa', borderRadius: 10 }}
        >
          <Descriptions.Item label="Mã ID">
            <Tag color="processing">{doctorData.id}</Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Email">
            <Text copyable>{doctorData.email}</Text>
          </Descriptions.Item>

          <Descriptions.Item label="Số điện thoại">
            <Text copyable>{doctorData.phone}</Text>
          </Descriptions.Item>

          <Descriptions.Item label="Chuyên khoa">
            <Text>{doctorData.specialty}</Text>
          </Descriptions.Item>
        </Descriptions>

        <div style={{ textAlign: 'right', marginTop: 30 }}>
          <Button
            type="primary"
            icon={<KeyOutlined />}
            onClick={() => setIsPasswordModalVisible(true)}
            style={{
              background: 'linear-gradient(135deg, #1677ff, #4096ff)',
              border: 'none',
              fontWeight: 500,
              boxShadow: '0 4px 12px rgba(22,119,255,0.3)',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            Đổi mật khẩu
          </Button>
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
