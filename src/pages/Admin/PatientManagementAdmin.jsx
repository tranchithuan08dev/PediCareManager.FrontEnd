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
    Input,
    Form,
    Select,
    DatePicker,
    message
} from 'antd';
import { EyeOutlined, UserOutlined, PhoneOutlined, HomeOutlined, SearchOutlined, EditOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css'; 
import { useDispatch, useSelector } from 'react-redux';
import { fetchGetAllPatient, fetchGetDetailPatient, fecthUpdatePatient } from '../../store/patientSlice';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const PatientManagementAdmin = () => {
    const [messageApi, contextHolder] = message.useMessage(); // ⭐️
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [searchText, setSearchText] = useState(''); 
    const [editForm] = Form.useForm();
    
    const initialPatientData = useSelector((state)=> state?.PATIENT?.listPatient) || []; 
    const dispatch = useDispatch();

    useEffect(()=>{
        dispatch(fetchGetAllPatient())
    },[dispatch])

    const filteredData = initialPatientData.filter(item => {
        if (searchText === '') return true;
        return item.fullName.toLowerCase().includes(searchText.toLowerCase());
    });

    const calculateAge = (dob) => {
        if (!dob) return 'N/A';
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        return age;
    };
    
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
            .catch((error) => console.error("Lỗi mạng:", error));
    };

    const handleOpenEditModal = (record) => {
        dispatch(fetchGetDetailPatient(record.id))
            .then((response) => {
                if (response.meta.requestStatus === 'fulfilled' && response.payload) {
                    const patient = response.payload;
                    setSelectedPatient(patient);
                    editForm.setFieldsValue({
                        patientCode: patient.patientCode,
                        fullName: patient.fullName,
                        dateOfBirth: patient.dateOfBirth ? dayjs(patient.dateOfBirth) : null,
                        gender: patient.gender,
                        address: patient.address,
                        representativeName: patient.representativeName,
                        representativePhone: patient.representativePhone,
                    });
                    setIsEditModalVisible(true);
                }
            })
            .catch((error) => console.error("Lỗi mạng:", error));
    };

    const handleEditSubmit = () => {
        editForm.validateFields()
            .then((values) => {
                const payload = {
                    id: selectedPatient.id,
                    patientCode: values.patientCode,
                    fullName: values.fullName,
                    dateOfBirth: values.dateOfBirth 
                        ? values.dateOfBirth.format('YYYY-MM-DD') 
                        : null,
                    gender: values.gender,
                    address: values.address,
                    representativeName: values.representativeName,
                    representativePhone: values.representativePhone,
                };

                dispatch(fecthUpdatePatient(payload))
                    .then((response) => {
                        if (response.meta.requestStatus === 'fulfilled') {
                            messageApi.success('Cập nhật bệnh nhân thành công!'); // ⭐️
                            setIsEditModalVisible(false);
                            editForm.resetFields();
                            dispatch(fetchGetAllPatient());
                        } else {
                            messageApi.error('Cập nhật thất bại. Vui lòng thử lại!'); // ⭐️
                        }
                    });
            })
            .catch(() => messageApi.warning('Vui lòng kiểm tra lại thông tin!')); // ⭐️
    };

    const columns = [
        {
            title: 'Mã BN',
            dataIndex: 'patientCode',
            key: 'patientCode',
            width: 130,
            render: (code) => code || <Tag color="warning">Chưa có mã</Tag>
        },
        {
            title: 'Họ và Tên',
            dataIndex: 'fullName',
            key: 'fullName',
            width: 300,
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
                    <Text type="secondary" style={{ fontSize: '0.8em' }}>({calculateAge(dob)} tuổi)</Text>
                </Space>
            )
        },
        {
            title: 'Địa Chỉ',
            dataIndex: 'address',
            key: 'address',
            ellipsis: true, 
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
            width: 200,
            render: (_, record) => (
                <Space size="small"> 
                    <Button 
                        type="default" 
                        icon={<EyeOutlined />} 
                        onClick={() => handleViewDetail(record)}
                        size="small"
                        title="Xem chi tiết hồ sơ cá nhân"
                    >
                        Chi tiết
                    </Button>
                    <Button 
                        type="primary" 
                        icon={<EditOutlined />} 
                        onClick={() => handleOpenEditModal(record)}
                        size="small"
                        title="Chỉnh sửa thông tin bệnh nhân"
                    >
                        Sửa
                    </Button>
                </Space>
            ),
        },
    ];

    const DetailModal = () => (
        <Modal
            title={<Title level={4}><UserOutlined /> Hồ Sơ Bệnh Nhân: {selectedPatient?.fullName}</Title>}
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={null} 
            width={750}
        >
            {selectedPatient ? (
                <Descriptions bordered column={2} size="middle" layout="vertical">
                    <Descriptions.Item label="Mã Bệnh Nhân" span={1}>
                        <Text strong copyable>{selectedPatient.patientCode || 'Chưa có mã'}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Họ và Tên" span={1}>
                        <Text style={{ fontSize: '1.1em', color: '#1890ff' }} strong>{selectedPatient.fullName}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày Sinh">{selectedPatient.dateOfBirth || 'Chưa rõ'}</Descriptions.Item>
                    <Descriptions.Item label="Giới Tính">
                        <Tag color={selectedPatient.gender === 'male' ? 'blue' : 'pink'}>
                            {selectedPatient.gender === 'male' ? 'Nam' : 'Nữ'}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tuổi">{calculateAge(selectedPatient.dateOfBirth)}</Descriptions.Item>
                    <Descriptions.Item label="Mã BHYT/BHCC">{selectedPatient.healthInsuranceCode || 'Không có'}</Descriptions.Item>
                    <Descriptions.Item label="Điện Thoại Người Đại Diện">
                        <Space><PhoneOutlined /> <Text copyable>{selectedPatient.representativePhone}</Text></Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tên Người Đại Diện">{selectedPatient.representativeName}</Descriptions.Item>
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

    const EditModal = () => (
        <Modal
            title={<Title level={4}><EditOutlined /> Chỉnh Sửa Bệnh Nhân: {selectedPatient?.fullName}</Title>}
            open={isEditModalVisible}
            onCancel={() => { setIsEditModalVisible(false); editForm.resetFields(); }}
            onOk={handleEditSubmit}
            okText="Lưu thay đổi"
            cancelText="Hủy"
            width={700}
            okButtonProps={{ type: 'primary' }}
        >
            <Form
                form={editForm}
                layout="vertical"
                style={{ marginTop: 16 }}
            >
               

                <Form.Item
                    label="Họ và Tên"
                    name="fullName"
                    rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                >
                    <Input placeholder="Nhập họ và tên" />
                </Form.Item>

                <Space style={{ width: '100%' }} size="large">
                    <Form.Item
                        label="Ngày Sinh"
                        name="dateOfBirth"
                        style={{ width: 220 }}
                    >
                        <DatePicker 
                            format="YYYY-MM-DD" 
                            placeholder="Chọn ngày sinh"
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Giới Tính"
                        name="gender"
                        rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                        style={{ width: 200 }}
                    >
                        <Select placeholder="Chọn giới tính">
                            <Option value="male">Nam</Option>
                            <Option value="female">Nữ</Option>
                        </Select>
                    </Form.Item>
                </Space>

                <Form.Item
                    label="Địa Chỉ"
                    name="address"
                >
                    <Input.TextArea rows={2} placeholder="Nhập địa chỉ thường trú" />
                </Form.Item>

                <Space style={{ width: '100%' }} size="large">
                    <Form.Item
                        label="Tên Người Đại Diện"
                        name="representativeName"
                        style={{ width: 300 }}
                    >
                        <Input placeholder="Nhập tên người đại diện" />
                    </Form.Item>

                    <Form.Item
                        label="SĐT Người Đại Diện"
                        name="representativePhone"
                        rules={[{ pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }]}
                        style={{ width: 250 }}
                    >
                        <Input placeholder="Nhập số điện thoại" />
                    </Form.Item>
                </Space>
            </Form>
        </Modal>
    );

    return (
        <Card title="Danh Sách Bệnh Nhân" style={{ margin: '20px' }}>
            {contextHolder} {/* ⭐️ BẮT BUỘC */}
            
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <Input
                    placeholder="Tìm kiếm theo Họ và Tên Bệnh Nhân..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 300 }}
                    allowClear
                />
            </div>

            <Table 
                columns={columns} 
                dataSource={filteredData} 
                rowKey="id" 
                pagination={{ pageSize: 7 }} 
            />
            
            <DetailModal />
            <EditModal />
        </Card>
    );
};

export default PatientManagementAdmin;