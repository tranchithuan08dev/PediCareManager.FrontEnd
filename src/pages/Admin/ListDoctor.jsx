import React, { useEffect, useState } from 'react';
import { 
    Table, 
    Button, 
    Modal, 
    Typography, 
    Space, 
    Tag, 
    Descriptions, 
    notification 
} from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css'; 
import { useDispatch, useSelector } from 'react-redux';
import { fetchGetAllUsers, fetchGetDetailUser } from '../../store/userSlice';


const { Title, Text } = Typography;


const ListDoctor = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [api, contextHolder] = notification.useNotification(); 
    const DUMMY_USER_LIST = useSelector((state) => state.USER.listUsers)
    const dispatch = useDispatch();

    useEffect(()=> {
     dispatch(fetchGetAllUsers())
    },[dispatch]);
    
    


const handleViewDetail = async (record) => {
  try {
    if (!record?.id) {
      api.error({
        message: 'Thiếu thông tin',
        description: 'Không có ID người dùng để xem chi tiết.',
      });
      return;
    }

    const resultAction = await dispatch(fetchGetDetailUser(record.id));

    const detailData = resultAction.payload; 

    if (detailData) {
      setSelectedUser(detailData);
      setIsModalVisible(true);
    } else {
      api.error({
        message: 'Không tìm thấy dữ liệu',
        description: 'Không tìm thấy chi tiết người dùng.',
      });
    }
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết người dùng:", error);
    api.error({
      message: 'Lỗi API',
      description: 'Không thể kết nối hoặc lấy dữ liệu chi tiết.',
    });
  }
};


    const columns = [
        {
            title: 'ID', 
            dataIndex: 'id', 
            key: 'id', 
            width: 80
        },
        {
            title: 'Họ và Tên', 
            dataIndex: 'fullName', 
            key: 'fullName',
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: 'Tên Đăng Nhập', 
            dataIndex: 'username', 
            key: 'username'
        },
        {
            title: 'Email', 
            dataIndex: 'email', 
            key: 'email'
        },
        {
            title: 'Vai Trò (Role)', 
            dataIndex: 'role', 
            key: 'role',
            render: (role) => (
                <Tag color={role === 'Admin' ? 'geekblue' : 'green'}>
                    {role.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Hành Động',
            key: 'action',
            width: 120,
            render: (_, record) => (
                <Button 
                    type="primary" 
                    icon={<EyeOutlined />} 
                    onClick={() => handleViewDetail(record)}
                    size="small"
                >
                    Chi tiết
                </Button>
            ),
        },
    ];

    // --- Modal Hiển thị Chi tiết Người dùng ---
    const UserDetailModal = () => (
        <Modal
            title={<Title level={4}>Chi Tiết Người Dùng: {selectedUser?.fullName}</Title>}
            open={isModalVisible} 
            onCancel={() => setIsModalVisible(false)} 
            footer={[
                <Button key="close" onClick={() => setIsModalVisible(false)}>
                    Đóng
                </Button>
            ]}
            width={700}
        >
            {selectedUser ? (
                <Descriptions bordered column={2} size="middle">
                    <Descriptions.Item label="ID">{selectedUser.id}</Descriptions.Item>
                    <Descriptions.Item label="Vai Trò">
                        <Tag color={selectedUser.role === 'Admin' ? 'geekblue' : 'green'}>
                            {selectedUser.role}
                        </Tag>
                    </Descriptions.Item>
                    
                    <Descriptions.Item label="Tên Đầy Đủ" span={2}>
                        <Text copyable>{selectedUser.fullName}</Text>
                    </Descriptions.Item>

                    <Descriptions.Item label="Tên Đăng Nhập">{selectedUser.username}</Descriptions.Item>
                    <Descriptions.Item label="Số Điện Thoại"><Text copyable>{selectedUser.phone}</Text></Descriptions.Item>

                    <Descriptions.Item label="Email" span={2}><Text copyable>{selectedUser.email}</Text></Descriptions.Item>

                    {/* Kiểm tra trường createdAt có tồn tại không */}
                    {selectedUser.createdAt && (
                         <Descriptions.Item label="Ngày Tạo" span={2}>
                            {new Date(selectedUser.createdAt).toLocaleString('vi-VN')}
                        </Descriptions.Item>
                    )}

                </Descriptions>
            ) : (
                <Text>Đang tải dữ liệu...</Text>
            )}
        </Modal>
    );


    return (
        <div style={{ padding: '24px' }}>
            {contextHolder}
            <Title level={3}>Danh Sách Người Dùng</Title>
            
            <Table 
                columns={columns} 
                dataSource={DUMMY_USER_LIST} 
                rowKey="id" 
                pagination={{ pageSize: 10 }} 
            />
            
            <UserDetailModal />
        </div>
    );
};

export default ListDoctor;