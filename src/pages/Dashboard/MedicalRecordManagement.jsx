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
    Divider,
} from 'antd';
import { EyeOutlined, FileTextOutlined, CalendarOutlined, SolutionOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css'; 
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGetPatientHistory } from '../../store/patientSlice';
import { fetchGetDetailMedicineRecords } from '../../store/medicineSlice';

const { Title, Text } = Typography;

const MedicalRecordManagement = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
   const initialRecordData = useSelector((state)=> state?.PATIENT?.patientHistory) || []; 
  
 const location = useLocation();
  const { patientCode } = location.state || {}; 
  const dispatch = useDispatch();
  useEffect(()=>{
     dispatch(fetchGetPatientHistory(patientCode))
  },[]);
    // Hàm tiện ích để định dạng ngày giờ
    const formatDate = (isoString) => {
        if (!isoString) return 'N/A';
        return new Date(isoString).toLocaleString('vi-VN');
    };

    const handleViewDetail = (record) => {
       
            dispatch(fetchGetDetailMedicineRecords(record.medicalRecordId))
                    .then((response) => {
                        if (response.meta.requestStatus === 'fulfilled' && response.payload) {
                            setSelectedRecord(response.payload); 
                            setIsModalVisible(true);
                        } else {
                            console.error("Lỗi khi lấy chi tiết khám bệnh: ", response.error.message);
                        }
                    })
                    .catch((error) => {
                         console.error("Lỗi mạng:", error);
                    });
    };

    const columns = [
        {
            title: 'Mã HS',
            dataIndex: 'medicalRecordId',
            key: 'medicalRecordId',
            width: 100,
            render: (id) => <Tag color="processing">HS-{id}</Tag>
        },
        {
            title: 'Ngày Khám',
            dataIndex: 'visitDate',
            key: 'visitDate',
            width: 180,
            sorter: (a, b) => new Date(b.visitDate) - new Date(a.visitDate),
            render: (date) => formatDate(date), 
        },
        {
            title: 'Bác Sĩ',
            dataIndex: 'doctorName',
            key: 'doctorName',
        },
        {
            title: 'Số Thuốc',
            dataIndex: 'prescriptionItems',
            key: 'itemCount',
            width: 100,
            align: 'center',
            render: (items) => <Text strong>{items?.length || 0}</Text>,
        },
        {
            title: 'Thuốc Chính',
            key: 'mainMedicine',
            render: (_, record) => (
                <Text type="secondary" italic>
                    {record.prescriptionItems?.[0]?.medicineName || 'Không có'}
                </Text>
            ),
        },
        {
            title: 'Hành Động',
            key: 'action',
            width: 120,
            render: (_, record) => (
                <Button 
                    type="primary" // Thay đổi thành primary để nổi bật
                    icon={<EyeOutlined />} 
                    onClick={() => handleViewDetail(record)}
                    size="small"
                >
                    Chi tiết
                </Button>
            ),
        },
    ];
    
    // ĐỊNH NGHĨA CỘT CHO BẢNG ĐƠN THUỐC CON
    const prescriptionColumns = [
        {
            title: 'Thuốc',
            dataIndex: 'medicineName',
            key: 'medicineName',
            render: (text) => <Text strong>{text}</Text>
        },
         
        {
            title: 'Đơn Vị',
            dataIndex: 'unit',
            key: 'unit',
            width: 80,
            render: (text) => text || 'Viên',
        },
        {
            title: 'Số Lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 90,
            align: 'right',
        },
        {
            title: 'Hướng Dẫn Sử Dụng',
            dataIndex: 'usageInstruction',
            key: 'usageInstruction',
            ellipsis: true,
        },
    ];


    // Component Modal để hiển thị chi tiết Hồ sơ
    const DetailModal = () => (
        <Modal
            title={<Title level={4}><FileTextOutlined /> Chi Tiết Hồ Sơ Khám Bệnh: HS-{selectedRecord?.id || selectedRecord?.medicalRecordId}</Title>}
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={null} 
            width={1000} // Tăng chiều rộng để chứa nhiều thông tin
        >
            {selectedRecord ? (
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    
                    {/* KHU VỰC 1: THÔNG TIN CHUNG */}
                    <Title level={5} style={{ marginBottom: 0, color: '#1890ff' }}>Thông Tin Cơ Bản</Title>
                    <Descriptions bordered column={{ xs: 1, sm: 2, lg: 3 }} size="middle">
                        <Descriptions.Item label="Mã Hồ Sơ" span={1}>
                            <Tag color="processing">HS-{selectedRecord.id || selectedRecord.medicalRecordId}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày Khám" span={1}>
                            <CalendarOutlined /> {formatDate(selectedRecord.visitDate)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Bệnh Nhân" span={1}>
                             <Text strong>{selectedRecord.patient?.fullName || 'N/A'}</Text>
                        </Descriptions.Item>
                        
                        <Descriptions.Item label="Bác Sĩ">
                            {selectedRecord.doctor?.doctorName || selectedRecord.doctorName}
                        </Descriptions.Item>
                         <Descriptions.Item label="Chuyên Khoa">
                            {selectedRecord.doctor?.specialty || 'Chung'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tuổi BN">{selectedRecord.patientAgeAtVisit || 'N/A'}</Descriptions.Item>
                    </Descriptions>

                    {/* KHU VỰC 2: TÌNH TRẠNG LÂM SÀNG */}
                    <Divider orientation="left" plain><SolutionOutlined /> **Tình Trạng Lâm Sàng & Chẩn Đoán**</Divider>
                    <Descriptions bordered column={2} size="small" layout="vertical">
                         <Descriptions.Item label="Triệu Chứng" span={2}>
                            {selectedRecord.symptoms || 'Chưa ghi nhận'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Kết Quả Khám (Clinical Findings)" span={2}>
                            {selectedRecord.clinicalFindings || 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Chẩn Đoán">
                            <Tag color="red">{selectedRecord.diagnosis || 'N/A'}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Xử Trí (Treatment)">
                            {selectedRecord.treatment || 'N/A'}
                        </Descriptions.Item>

                        <Descriptions.Item label="Huyết Áp">{selectedRecord.bloodPressure || 'N/A'}</Descriptions.Item>
                        <Descriptions.Item label="Nhịp Tim">{selectedRecord.heartRate || 'N/A'} bpm</Descriptions.Item>
                        <Descriptions.Item label="Nhiệt Độ">{selectedRecord.bodyTemperature || 'N/A'} °C</Descriptions.Item>
                        <Descriptions.Item label="Dị Ứng Thuốc">
                            <Tag color="volcano">{selectedRecord.drugAllergy || 'Không'}</Tag>
                        </Descriptions.Item>
                        
                    </Descriptions>

                    {/* KHU VỰC 3: ĐƠN THUỐC */}
                    <Divider orientation="left" plain><SolutionOutlined /> **Đơn Thuốc**</Divider>
                    <Text italic type="secondary">Ghi chú đơn thuốc: {selectedRecord.notes || selectedRecord.prescription?.note || 'Không có'}</Text>
                    <Table 
                        columns={prescriptionColumns} 
                        // Lấy danh sách thuốc từ object 'prescription' lồng bên trong chi tiết
                        dataSource={selectedRecord.prescription?.items || selectedRecord.prescriptionItems} 
                        rowKey={(record, index) => index}
                        pagination={false} 
                        size="small"
                        bordered
                    />
                    
                </Space>
            ) : (
                <Text>Đang tải dữ liệu chi tiết...</Text>
            )}
            
            <Space style={{ marginTop: 20, width: '100%', justifyContent: 'flex-end' }}>
                 <Button onClick={() => setIsModalVisible(false)}>Đóng</Button>
            </Space>
        </Modal>
    );

    return (
        <Card title="Danh Sách Hồ Sơ Bệnh Án" style={{ margin: '20px' }}>
            <Table 
                columns={columns} 
                dataSource={initialRecordData} 
                rowKey="medicalRecordId" 
                pagination={{ pageSize: 10 }} 
            />
            
            {/* Component Modal */}
            <DetailModal />
        </Card>
    );
};

export default MedicalRecordManagement;