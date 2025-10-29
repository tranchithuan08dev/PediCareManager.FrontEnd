import React, { useEffect, useState } from 'react';
import { 
    Table, 
    Button, 
    Modal, 
    Typography, 
    Space, 
    Tag, 
    Card,
    Descriptions,
    Row, // Dùng để định dạng trong Descriptions
    Col, // Dùng để định dạng trong Descriptions
} from 'antd';
import { EyeOutlined, UserOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css'; 
import { useDispatch, useSelector } from 'react-redux';
import { fetchGetAllPatient, fetchGetDetailPatient } from '../../store/patientSlice';

const { Title, Text } = Typography;

const PatientManagement = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
      const initialPatientData = useSelector((state)=> state?.PATIENT?.listPatient) || []; 
    const detailMedicine = useSelector((state) => state?.PATIENT?.patientDetail)
 const dispatch = useDispatch();
    useEffect(()=>{
        dispatch(fetchGetAllPatient())
    },[dispatch])
    // Hàm tiện ích tính tuổi
    const calculateAge = (dob) => {
        if (!dob) return 'N/A';
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    // Xử lý khi người dùng nhấn nút "Xem Chi tiết"
    const handleViewDetail = (record) => {
         dispatch(fetchGetDetailPatient(record.id))
                    .then((response) => {
                        if (response.meta.requestStatus === 'fulfilled' && response.payload) {
                            setSelectedPatient(response.payload); 
                            setIsModalVisible(true);
                        } else {
                          
                            console.error("Lỗi khi lấy chi tiết bệnh nhân: ", response.error.message);
                          
                        }
                    })
                    .catch((error) => {
                         console.error("Lỗi mạng:", error);
                    });
    };

    // Định nghĩa cấu trúc cột cho Ant Design Table
    const columns = [
        {
            title: 'Mã BN',
            dataIndex: 'patientCode',
            key: 'patientCode',
            width: 120,
            render: (code) => code || <Tag color="warning">Chưa có mã</Tag>
        },
        {
            title: 'Họ và Tên',
            dataIndex: 'fullName',
            key: 'fullName',
            render: (text) => <Text strong>{text}</Text>, 
        },
        {
            title: 'Giới Tính',
            dataIndex: 'gender',
            key: 'gender',
            width: 100,
            render: (gender) => (
                <Tag color={gender === 'male' ? 'blue' : 'pink'}>
                    {gender === 'male' ? 'Nam' : 'Nữ'}
                </Tag>
            ),
        },
        {
            title: 'Ngày Sinh (Tuổi)',
            dataIndex: 'dateOfBirth',
            key: 'dateOfBirth',
            width: 150,
            render: (dob) => (
                <Space direction="vertical" size={0}>
                    <Text>{dob || 'N/A'}</Text>
                    <Text type="secondary" style={{ fontSize: '0.8em' }}>
                        ({calculateAge(dob)} tuổi)
                    </Text>
                </Space>
            )
        },
        {
            title: 'Địa Chỉ',
            dataIndex: 'address',
            key: 'address',
            ellipsis: true, // Thêm dấu ba chấm nếu quá dài
        },
        {
            title: 'Người Đại Diện',
            dataIndex: 'representativeName',
            key: 'representativeName',
            width: 150,
        },
        {
            title: 'Hành Động',
            key: 'action',
            width: 120,
            render: (_, record) => (
                <Button 
                    type="default" 
                    icon={<EyeOutlined />} 
                    onClick={() => handleViewDetail(record)}
                    size="small"
                >
                    Chi tiết
                </Button>
            ),
        },
    ];

    // Component Modal để hiển thị chi tiết
    const DetailModal = () => (
        <Modal
            title={<Title level={4}><UserOutlined /> Hồ Sơ Bệnh Nhân: {selectedPatient?.fullName}</Title>}
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={null} // Không cần footer
            width={750}
        >
            {selectedPatient ? (
                // Descriptions: Ant Design Component giúp hiển thị chi tiết theo dạng key-value
                <Descriptions bordered column={2} size="middle" layout="vertical">
                    
                    {/* Hàng 1: Mã BN và Tên */}
                    <Descriptions.Item label="Mã Bệnh Nhân" span={1}>
                        <Text strong copyable>{selectedPatient.patientCode || 'Chưa có mã'}</Text>
                    </Descriptions.Item>
                     <Descriptions.Item label="Họ và Tên" span={1}>
                        <Text style={{ fontSize: '1.1em', color: '#1890ff' }} strong>{selectedPatient.fullName}</Text>
                    </Descriptions.Item>

                    {/* Hàng 2: Ngày sinh, Giới tính, Tuổi */}
                    <Descriptions.Item label="Ngày Sinh">
                        {selectedPatient.dateOfBirth || 'Chưa rõ'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Giới Tính">
                        <Tag color={selectedPatient.gender === 'male' ? 'blue' : 'pink'}>
                            {selectedPatient.gender === 'male' ? 'Nam' : 'Nữ'}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tuổi">
                        {calculateAge(selectedPatient.dateOfBirth)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Mã BHYT/BHCC">
                        {selectedPatient.healthInsuranceCode || 'Không có'}
                    </Descriptions.Item>


                    {/* Hàng 3: Liên hệ */}
                    <Descriptions.Item label="Điện Thoại Người Đại Diện">
                        <Space>
                            <PhoneOutlined /> <Text copyable>{selectedPatient.representativePhone}</Text>
                        </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tên Người Đại Diện">
                        {selectedPatient.representativeName}
                    </Descriptions.Item>
                    
                    {/* Hàng 4: Địa chỉ */}
                    <Descriptions.Item label="Địa Chỉ Thường Trú" span={2}>
                        <HomeOutlined style={{ marginRight: 8 }} />
                        <Text italic>{selectedPatient.address}</Text>
                    </Descriptions.Item>

                </Descriptions>
            ) : (
                <Text>Đang tải dữ liệu...</Text>
            )}
            
            <Space style={{ marginTop: 20, width: '100%', justifyContent: 'flex-end' }}>
                 <Button onClick={() => setIsModalVisible(false)}>Đóng</Button>
            </Space>
        </Modal>
    );

    return (
        <Card title="Danh Sách Bệnh Nhân" style={{ margin: '20px' }}>
            <Table 
                columns={columns} 
                dataSource={initialPatientData} 
                rowKey="id" 
                pagination={{ pageSize: 7 }} 
            />
            
            {/* Component Modal */}
            <DetailModal />
        </Card>
    );
};

export default PatientManagement;