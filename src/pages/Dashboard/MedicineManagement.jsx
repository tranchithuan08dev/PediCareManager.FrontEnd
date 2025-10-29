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
    Input // ⭐️ IMPORT THÊM INPUT
} from 'antd';
import { EyeOutlined, SearchOutlined } from '@ant-design/icons'; // ⭐️ IMPORT THÊM ICON
import 'antd/dist/reset.css'; 
import { useDispatch, useSelector } from 'react-redux';
import { fetchGetAllMedicine, fetchGetDetailMedicine } from '../../store/medicineSlice';

const { Title, Text } = Typography;

const MedicineManagement = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [searchText, setSearchText] = useState(''); 

    const initialData = useSelector((state)=> state?.MEDICINE?.listMedicine) || []; 
    const detailMedicine = useSelector((state) => state?.MEDICINE?.medicineDetail)
    console.log("detail", detailMedicine);
    
    const dispatch = useDispatch();
    useEffect(()=>{
        dispatch(fetchGetAllMedicine())
    },[dispatch])


    const filteredData = initialData.filter(item => {
        if (searchText === '') {
            return true;
        }
        return item.medicineName.toLowerCase().includes(searchText.toLowerCase());
    });

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

    const DetailModal = () => (
        <Modal
            title={<Title level={4}>Thông Tin Chi Tiết Thuốc: {selectedMedicine?.medicineName}</Title>}
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={null} 
            width={700}
        >
             {selectedMedicine ? (
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
            
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <Input
                    placeholder="Tìm kiếm theo Tên Thuốc..."
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
        </Card>
    );
};

export default MedicineManagement;