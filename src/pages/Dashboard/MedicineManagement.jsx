import React, { useEffect, useState } from 'react';
import { 
    Table, 
    Button, 
    Modal, 
    Typography, 
    Space, 
    Tag, 
    Card,
    Descriptions // Import Descriptions để hiển thị chi tiết
} from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css'; 
import { useDispatch, useSelector } from 'react-redux';
import { fetchGetAllMedicine, fetchGetDetailMedicine } from '../../store/medicineSlice';

const { Title, Text } = Typography;

// 1. DỮ LIỆU MẪU (Sử dụng dữ liệu bạn cung cấp)
const initialData = [
    {
        "id": 1,
        "medicineName": "Paracetamol 500mg",
        "category": "Thuốc giảm đau hạ sốt",
        "unit": "Viên",
        "quantityInStock": 150,
        "priceSell": 1000.00,
        "expiryDate": "2026-06-30"
    },
    {
        "id": 2,
        "medicineName": "Vitamin C 100mg",
        "category": "Vitamin & Khoáng chất",
        "unit": "Chai 100 viên nén",
        "quantityInStock": 1697,
        "priceSell": 1500.00,
        "expiryDate": "2025-10-27"
    },
    // Thêm một số thuốc khác để minh họa
    {
        "id": 3,
        "medicineName": "Amoxicillin 250mg",
        "category": "Thuốc kháng sinh",
        "unit": "Hộp 10 vỉ",
        "quantityInStock": 320,
        "priceSell": 5500.00,
        "expiryDate": "2027-01-15"
    }
];

// 2. DỮ LIỆU CHI TIẾT MẪU (Dữ liệu đầy đủ hơn khi xem chi tiết)
// Trong một ứng dụng thực tế, bạn sẽ gọi API để lấy dữ liệu này dựa trên 'id'
const detailDataExample = {
    "id": 1,
    "medicineName": "Paracetamol 500mg",
    "category": "Thuốc giảm đau hạ sốt",
    "unit": "Viên",
    "quantityInStock": 150,
    "priceImport": 450.00, // Chi tiết bổ sung
    "priceSell": 1000.00,
    "expiryDate": "2026-06-30",
    "supplier": "Công ty Dược Hậu Giang", // Chi tiết bổ sung
    "createdAt": "2025-10-27T04:01:50.8939734" // Chi tiết bổ sung
};


const MedicineManagement = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const initialData = useSelector((state)=> state?.MEDICINE?.listMedicine)
    const detailMedicine = useSelector((state) => state?.MEDICINE?.medicineDetail)
    console.log("detail", detailMedicine);
    
    const dispatch = useDispatch();
    useEffect(()=>{
        dispatch(fetchGetAllMedicine())
    },[dispatch])


    // Xử lý khi người dùng nhấn nút "Xem Chi tiết"
  const handleViewDetail = (record) => {
    dispatch(fetchGetDetailMedicine(record.id))
        .then((response) => {
            if (response.meta.requestStatus === 'fulfilled' && response.payload) {
                
                setSelectedMedicine(response.payload); 
                
               
                setIsModalVisible(true);
            } else {
              
                console.error("Lỗi khi lấy chi tiết thuốc:", response.error.message);
              
            }
        })
        .catch((error) => {
             console.error("Lỗi mạng:", error);
        });
};

    // Định nghĩa cấu trúc cột cho Ant Design Table
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 70,
        },
        {
            title: 'Tên Thuốc',
            dataIndex: 'medicineName',
            key: 'medicineName',
            // Tạo liên kết hoặc style nổi bật cho tên
            render: (text) => <Text strong>{text}</Text>, 
        },
        {
            title: 'Danh Mục',
            dataIndex: 'category',
            key: 'category',
            render: (text) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: 'Đơn Vị',
            dataIndex: 'unit',
            key: 'unit',
            width: 120,
        },
        {
            title: 'Tồn Kho',
            dataIndex: 'quantityInStock',
            key: 'quantityInStock',
            width: 100,
            align: 'right',
            // Sử dụng Tag để highlight
            render: (quantity) => (
                <Tag color={quantity < 200 ? 'volcano' : 'green'}>
                    {quantity}
                </Tag>
            )
        },
        {
            title: 'Giá Bán',
            dataIndex: 'priceSell',
            key: 'priceSell',
            width: 120,
            align: 'right',
            render: (price) => `${price.toLocaleString('vi-VN')} đ`,
        },
        {
            title: 'Ngày Hết Hạn',
            dataIndex: 'expiryDate',
            key: 'expiryDate',
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
            title={<Title level={4}>Thông Tin Chi Tiết Thuốc: {selectedMedicine?.medicineName}</Title>}
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={null} // Không cần footer
            width={700}
        >
            {selectedMedicine ? (
                // Descriptions: Ant Design Component giúp hiển thị chi tiết theo dạng key-value
                <Descriptions bordered column={2} size="middle">
                    <Descriptions.Item label="ID">{selectedMedicine.id}</Descriptions.Item>
                    <Descriptions.Item label="Danh Mục"><Tag color="blue">{selectedMedicine.category}</Tag></Descriptions.Item>
                    
                    <Descriptions.Item label="Tên Thuốc" span={2}>
                        <Text strong>{selectedMedicine.medicineName}</Text>
                    </Descriptions.Item>

                    <Descriptions.Item label="Đơn Vị">{selectedMedicine.unit}</Descriptions.Item>
                    <Descriptions.Item label="Nhà Cung Cấp">{selectedMedicine.supplier}</Descriptions.Item>

                    <Descriptions.Item label="Giá Nhập">
                        <Text type="secondary">{selectedMedicine.priceImport.toLocaleString('vi-VN')} đ</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Giá Bán">
                        <Text mark>{selectedMedicine.priceSell.toLocaleString('vi-VN')} đ</Text>
                    </Descriptions.Item>

                    <Descriptions.Item label="Tồn Kho">
                        <Tag color={selectedMedicine.quantityInStock < 200 ? 'volcano' : 'green'}>
                            {selectedMedicine.quantityInStock}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày Hết Hạn">{selectedMedicine.expiryDate}</Descriptions.Item>

                    <Descriptions.Item label="Ngày Tạo" span={2}>
                        {new Date(selectedMedicine.createdAt).toLocaleString('vi-VN')}
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
        <Card title="Danh Sách Thuốc " style={{ margin: '20px' }}>
            <Table 
                columns={columns} 
                dataSource={initialData} 
                rowKey="id" 
                pagination={{ pageSize: 5 }} 
            />
            
            {/* Component Modal */}
            <DetailModal />
        </Card>
    );
};

export default MedicineManagement;