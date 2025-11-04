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
    DatePicker, 
    InputNumber, 
    notification, 
    Row,
    Col
} from 'antd';
import { EyeOutlined, SearchOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons'; 
import 'antd/dist/reset.css'; 
import { useDispatch, useSelector } from 'react-redux';
import { fetchChangeQuanlity, fetchGetAllMedicine, fetchGetDetailMedicine, fetchUpdateMedicine } from '../../store/medicineSlice'; // Đã thêm fetchUpdateMedicineQuantity
import moment from 'moment'; 

const { Title, Text } = Typography;



const MedicineManagementAdmin = () => {
    const CURRENT_USER_ID = useSelector((state)=> state?.AUTH?.currentuser) || []; 
 
    
    const [api, contextHolder] = notification.useNotification(); 

    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [searchText, setSearchText] = useState(''); 
    
    const [isEditModalVisible, setIsEditModalVisible] = useState(false); 
    const [editingMedicine, setEditingMedicine] = useState(null); 
    const [form] = Form.useForm(); 
 
    const [updateQuantityData, setUpdateQuantityData] = useState({
        medicineId: 0,
        quantity: 0,
        unitPrice: 0.01,
        createdByUserId: CURRENT_USER_ID,
    });
    const [updateInfoData, setUpdateInfoData] = useState({
        id: 0,
        medicineName: '',
        category: '',
        unit: '',
        priceImport: 0,
        priceSell: 0,
        expiryDate: '',
        supplier: '',
    });


    const initialData = useSelector((state)=> state?.MEDICINE?.listMedicine) || []; 
 
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
                    setIsDetailModalVisible(true); 
                } else {
                    console.error("Lỗi khi lấy chi tiết thuốc:", response.error.message);
                }
            })
            .catch((error) => {
                     console.error("Lỗi mạng:", error);
            });
    };
    const handleEdit = (record) => {
        
        dispatch(fetchGetDetailMedicine(record.id))
            .then((response) => {
                if (response.meta.requestStatus === 'fulfilled' && response.payload) {
                    const data = response.payload;
                    
                    setEditingMedicine(data);
                    setIsEditModalVisible(true);

                    form.setFieldsValue({
                        id: data.id,
                        medicineName: data.medicineName,
                        category: data.category,
                        unit: data.unit,
                        priceImport: data.priceImport,
                        priceSell: data.priceSell,
                        supplier: data.supplier,
                        expiryDate: data.expiryDate ? moment(data.expiryDate) : null, 
                    });

                    setUpdateQuantityData({
                        medicineId: data.id,
                        quantity: 0, 
                        unitPrice: data.priceImport,
                        createdByUserId: CURRENT_USER_ID.id,
                    });


                } else {
                    api.error({ message: 'Lỗi', description: 'Không thể lấy chi tiết thuốc để chỉnh sửa.' }); 
                }
            });
    };

    const handleQuantityChange = async (values) => {
        try {
            // 1. Chuẩn bị dữ liệu từ form
            const payload = {
                medicineId: editingMedicine.id, 
                quantity: values.quantity,
                unitPrice: values.unitPrice,
                createdByUserId: CURRENT_USER_ID.id,
            };

            // 2. Tùy chọn: Cập nhật state (để đồng bộ hóa nếu cần, nhưng không cần thiết cho logic API)
            setUpdateQuantityData(payload);
         
            
            // 3. Gọi Redux Thunk Action (API)
            const resultAction = await dispatch(fetchChangeQuanlity(payload)); 

            if (fetchChangeQuanlity.fulfilled.match(resultAction)) {
                // 4. Xử lý thành công
                api.success({
                    message: 'Nhập hàng thành công',
                    description: `Đã nhập thêm ${payload.quantity} ${editingMedicine.unit} cho thuốc ${editingMedicine.medicineName}.`,
                });
                
                setIsEditModalVisible(false);

                // 5. Cập nhật lại danh sách thuốc
                dispatch(fetchGetAllMedicine()); 
            } else {
                // 6. Xử lý thất bại
                throw new Error(resultAction.error?.message || 'Cập nhật số lượng thất bại');
            }
        } catch (error) {
            // 7. Xử lý lỗi
            console.error('Lỗi khi cập nhật số lượng:', error);
            api.error({
                message: 'Lỗi khi nhập hàng',
                description: error.message || 'Đã xảy ra lỗi trong quá trình cập nhật số lượng thuốc.',
            });
        }
    };

    const handleInfoChange = async (values) => {
        try {
            const updatedData = {
                ...values,
                expiryDate: values.expiryDate ? values.expiryDate.format('YYYY-MM-DD') : null,
                id: editingMedicine.id,
            };

            setUpdateInfoData(updatedData);

            const resultAction = await dispatch(fetchUpdateMedicine(updatedData));

            if (fetchUpdateMedicine.fulfilled.match(resultAction)) {
                api.success({ 
                    message: 'Cập nhật thành công',
                    description: `Thông tin thuốc (ID: ${updatedData.id}) đã được cập nhật.`,
                });

                setIsEditModalVisible(false);

                dispatch(fetchGetAllMedicine()); 
            } else {
                throw new Error(resultAction.error?.message || 'Cập nhật thất bại');
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật thuốc:', error);
            api.error({ 
                message: 'Lỗi khi cập nhật',
                description: error.message || 'Đã xảy ra lỗi trong quá trình cập nhật thuốc.',
            });
        }
    };

 
    const columns = [
        {
            title: 'ID', dataIndex: 'id', key: 'id', width: 70,
        },
        {
            title: 'Tên Thuốc', dataIndex: 'medicineName', key: 'medicineName', 
            render: (text) => <Text strong>{text}</Text>, 
        },
        {
            title: 'Danh Mục', dataIndex: 'category', key: 'category', 
            render: (text) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: 'Đơn Vị', dataIndex: 'unit', key: 'unit', width: 120,
        },
        {
            title: 'Tồn Kho', dataIndex: 'quantityInStock', key: 'quantityInStock', width: 100, align: 'right',
            render: (quantity) => (
                <Tag color={quantity < 200 ? 'volcano' : 'green'}>
                    {quantity}
                </Tag>
            )
        },
        {
            title: 'Giá Bán', dataIndex: 'priceSell', key: 'priceSell', width: 120, align: 'right',
            render: (price) => `${price.toLocaleString('vi-VN')} đ`,
        },
        {
            title: 'Ngày Hết Hạn', dataIndex: 'expiryDate', key: 'expiryDate', width: 150,
        },
        {
            title: 'Hành Động',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space size="small">
                    <Button 
                        type="default" 
                        icon={<EyeOutlined />} 
                        onClick={() => handleViewDetail(record)}
                        size="small"
                    >
                        Chi tiết
                    </Button>
                    <Button 
                        type="primary" 
                        icon={<EditOutlined />} 
                        onClick={() => handleEdit(record)}
                        size="small"
                    >
                        Sửa
                    </Button>
                </Space>
            ),
        },
    ];

    // -------------------- MODAL CHỈNH SỬA THUỐC --------------------
    const EditMedicineModal = () => (
    <Modal
        title={<Title level={4}>Chỉnh Sửa Thuốc: {editingMedicine?.medicineName}</Title>}
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        width={900}
    >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            
            {/* Form Cập nhật Số lượng */}
            <Card title={<Text strong>1. Cập Nhật Số Lượng/Giá Nhập</Text>}>
                <Form
                    layout="vertical"
                    onFinish={handleQuantityChange}
                    initialValues={{
                        quantity: updateQuantityData.quantity,
                        unitPrice: editingMedicine?.priceImport, // Sử dụng giá nhập hiện tại làm giá trị mặc định ban đầu
                    }}
                >
                    <Text type="secondary">
                        Tồn kho hiện tại: {editingMedicine?.quantityInStock} {editingMedicine?.unit}
                    </Text>

                    <Row gutter={16} style={{ marginTop: 10 }}>
                        <Col span={8}>
                            <Form.Item
                                name="quantity"
                                label="Số lượng nhập thêm"
                                rules={[{ required: true, message: 'Nhập số lượng!' }]}
                            >
                                <InputNumber min={1} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="unitPrice"
                                label="Giá nhập mới (cho mỗi đơn vị)"
                                rules={[{ required: true, message: 'Nhập giá nhập!' }]}
                            >
                                <InputNumber
                                    min={0.01}
                                    step={0.01}
                                    style={{ width: '100%' }}
                                    formatter={(value) => `${value} đ`}
                                    parser={(value) => value.replace(' đ', '')}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8} style={{ display: 'flex', alignItems: 'end' }}>
                            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                                Lưu Số Lượng
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Card>

            <Card title={<Text strong>2. Cập Nhật Thông Tin Thuốc</Text>}>
                <Form
                    form={form} 
                    layout="vertical"
                    onFinish={handleInfoChange}
                >
                    <Form.Item name="id" hidden><Input /></Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="medicineName" label="Tên Thuốc" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="category" label="Danh Mục" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="unit" label="Đơn Vị" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={16}>
                            <Form.Item name="supplier" label="Nhà Cung Cấp" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="priceImport" label="Giá Nhập" rules={[{ required: true }]}>
                                <InputNumber
                                    min={0}
                                    style={{ width: '100%' }}
                                    formatter={(value) => `${value} đ`}
                                    parser={(value) => value.replace(' đ', '')}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="priceSell" label="Giá Bán" rules={[{ required: true }]}>
                                <InputNumber
                                    min={0}
                                    style={{ width: '100%' }}
                                    formatter={(value) => `${value} đ`}
                                    parser={(value) => value.replace(' đ', '')}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="expiryDate" label="Ngày Hết Hạn" rules={[{ required: true }]}>
                                <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item style={{ textAlign: 'right' }}>
                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                            Lưu Thông Tin Thuốc
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </Space>
    </Modal>
);


    const DetailModal = () => (
        <Modal
            title={<Title level={4}>Thông Tin Chi Tiết Thuốc: {selectedMedicine?.medicineName}</Title>}
            open={isDetailModalVisible} 
            onCancel={() => setIsDetailModalVisible(false)} 
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
                     <Button onClick={() => setIsDetailModalVisible(false)}>Đóng</Button>
            </Space>
        </Modal>
    );


    return (
        <Card title="Danh Sách Thuốc " style={{ margin: '20px' }}>
            {contextHolder}
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
            <EditMedicineModal /> 
        </Card>
    );
};

export default MedicineManagementAdmin;