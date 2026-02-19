import React, { useState } from 'react';
import { 
    DatePicker, 
    Button, 
    Card, 
    Table, 
    Typography, 
    Space, 
    Alert,
    Spin,
    Row,
    Col,
    notification
} from 'antd';
import { SearchOutlined, DollarOutlined, SolutionOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import 'antd/dist/reset.css'; 
import API from '../../services/api';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;


// Định nghĩa kiểu dữ liệu cho báo cáo
const initialReportData = {
    totalMedicalRecords: 0,
    totalMedicineRevenue: 0,
    medicineSalesDetails: [],
};

const DailyRevenueReport = () => {
    const [api, contextHolder] = notification.useNotification();
    // State cho ngày chọn
    const [dates, setDates] = useState([moment().subtract(1, 'month'), moment()]);
    // State chứa dữ liệu báo cáo
    const [reportData, setReportData] = useState(initialReportData);
    // State cho việc tải dữ liệu và lỗi
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Hàm định dạng tiền tệ
    const formatCurrency = (amount) => {
        return `${amount.toLocaleString('vi-VN')} VNĐ`;
    };

    // Hàm gọi API để lấy dữ liệu báo cáo
    const fetchRevenueData = async () => {
        if (!dates || dates.length !== 2) {
            setError("Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.");
            return;
        }

        setLoading(true);
        setError(null);

        // Định dạng ngày theo yêu cầu của API (YYYY-MM-DD)
        const startDate = dates[0].format('YYYY-MM-DD');
        const endDate = dates[1].format('YYYY-MM-DD');
        
       const apiUrl = `medical-records/daily-revenue?startDate=${startDate}&endDate=${endDate}`;


        try {
            // Thay thế bằng cuộc gọi API thực tế của bạn
            // Lưu ý: Nếu có vấn đề CORS/HTTPS, bạn có thể cần proxy hoặc cấu hình backend
            const response = await API.call().get(apiUrl); 
            
            if (response.data) {
                setReportData(response.data);
            } else {
                setReportData(initialReportData);
            }
        } catch (err) {
            console.error("Lỗi khi fetch dữ liệu:", err);
            setError("Không thể tải dữ liệu báo cáo. Vui lòng kiểm tra kết nối API.");
            setReportData(initialReportData);
        } finally {
            setLoading(false);
        }
    };

    // Định nghĩa cột cho bảng Chi tiết Doanh thu Thuốc
    const medicineColumns = [
        {
            title: 'ID',
            dataIndex: 'medicineId',
            key: 'medicineId',
            width: 80,
        },
        {
            title: 'Tên Thuốc',
            dataIndex: 'medicineName',
            key: 'medicineName',
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: 'Đơn Vị',
            dataIndex: 'unit',
            key: 'unit',
            width: 150,
        },
        {
            title: 'Số Lượng Đã Bán',
            dataIndex: 'totalQuantitySold',
            key: 'totalQuantitySold',
            width: 150,
            align: 'right',
            render: (quantity) => <Text type="success">{quantity}</Text>,
        },
        {
            title: 'Tổng Doanh Thu',
            dataIndex: 'totalRevenue',
            key: 'totalRevenue',
            width: 180,
            align: 'right',
            render: (revenue) => <Text mark>{formatCurrency(revenue)}</Text>,
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Title level={2}>📊 Báo Cáo Doanh Thu Thuốc Theo Ngày</Title>

            {/* Vùng chọn ngày và Button */}
            <Card style={{ marginBottom: 20 }}>
                <Space>
                    <Text strong>Chọn Khoảng Thời Gian:</Text>
                    <RangePicker
                        format="YYYY-MM-DD"
                        value={dates}
                        onChange={setDates}
                        style={{ width: 300 }}
                    />
                    <Button 
                        type="primary" 
                        icon={<SearchOutlined />} 
                        onClick={fetchRevenueData} 
                        loading={loading}
                    >
                        Xem Báo Cáo
                    </Button>
                </Space>
            </Card>

            {/* Xử lý lỗi và loading */}
            {contextHolder}
            {error && <Alert message="Lỗi" description={error} type="error" showIcon style={{ marginBottom: 20 }} />}
            {loading && <Spin tip="Đang tải dữ liệu..." style={{ display: 'block', margin: '20px auto' }} />}
            
            {/* Hiển thị Kết quả Thống kê */}
            <Title level={3}>Tóm Tắt Kết Quả</Title>
            <Row gutter={16}>
                <Col span={12}>
                    <Card bordered style={{ background: '#f0f2f5' }}>
                        <Statistic
                            title="Tổng Số Hồ Sơ Khám"
                            value={reportData.totalMedicalRecords}
                            formatter={(value) => <Text style={{fontSize: 24}}>{value}</Text>}
                            prefix={<SolutionOutlined style={{color: '#1890ff'}} />}
                        />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card bordered style={{ background: '#f0f5ff' }}>
                        <Statistic
                            title="Tổng Doanh Thu Thuốc"
                            value={reportData.totalMedicineRevenue}
                            formatter={(value) => <Text strong style={{fontSize: 24, color: '#52c41a'}}>{formatCurrency(value)}</Text>}
                            prefix={<DollarOutlined style={{color: '#52c41a'}} />}
                        />
                    </Card>
                </Col>
            </Row>

            <div style={{ marginTop: 30 }}>
                <Title level={3}>Chi Tiết Doanh Thu Thuốc</Title>
                <Table
                    columns={medicineColumns}
                    dataSource={reportData.medicineSalesDetails}
                    rowKey="medicineId"
                    pagination={{ pageSize: 5 }}
                    scroll={{ x: 'max-content' }}
                    locale={{ emptyText: "Không có dữ liệu bán hàng trong giai đoạn này" }}
                />
            </div>
        </div>
    );
};

// Cần thêm component Statistic vì nó chưa được import trong code gốc
const Statistic = ({ title, value, prefix, formatter }) => (
    <Space direction="vertical">
        <Text type="secondary" style={{ fontSize: 14 }}>{title}</Text>
        <Space>
            {prefix}
            {formatter ? formatter(value) : <Text style={{fontSize: 24}}>{value}</Text>}
        </Space>
    </Space>
);

export default DailyRevenueReport;