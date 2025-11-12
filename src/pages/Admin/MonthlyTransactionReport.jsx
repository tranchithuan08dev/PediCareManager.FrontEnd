import React, { useState, useMemo, useEffect } from 'react';
import { 
    Input, 
    Button, 
    Card, 
    Table, 
    Typography, 
    Space, 
    Alert,
    Spin,
    Row,
    Col,
    notification,
    Select,
} from 'antd';
import { Line } from 'react-chartjs-2';
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    Title as ChartTitle, 
    Tooltip, 
    Legend 
} from 'chart.js';
import { SearchOutlined, CalendarOutlined, PlusCircleOutlined, MinusCircleOutlined, DollarOutlined } from '@ant-design/icons';
import axios from 'axios';
import 'antd/dist/reset.css'; 
import API from '../../services/api';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGetAllMedicine } from '../../store/medicineSlice';
ChartJS.register(
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    ChartTitle, 
    Tooltip, 
    Legend
);

const { Title, Text } = Typography;
const currentYear = new Date().getFullYear();

// Định nghĩa kiểu dữ liệu cho giao dịch
const initialReportData = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    monthName: `Tháng ${i + 1}`,
    totalQuantityImported: 0,
    totalValueImported: 0,
    totalQuantitySold: 0,
    totalRevenueSold: 0,
}));

const MonthlyTransactionReport = () => {
    const [api, contextHolder] = notification.useNotification(); 
    const [year, setYear] = useState(currentYear.toString());
    const [medicineId, setMedicineId] = useState('');
    const [reportData, setReportData] = useState(initialReportData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const medicineData = useSelector((state)=> state?.MEDICINE?.listMedicine) || []; 
console.log("mdddd",medicineData);

   const dispatch = useDispatch();
    useEffect(()=>{
        dispatch(fetchGetAllMedicine())
    },[dispatch])


// **<<< LOGIC MỚI: TẠO OPTIONS CHO SELECT TÊN THUỐC >>>**
    const medicineOptions = useMemo(() => {
        // 1. Tùy chọn mặc định cho "Tất cả"
        const allOption = { value: '', label: 'Tất cả Thuốc' };
        
        // 2. Ánh xạ dữ liệu thuốc
        const options = medicineData.map(medicine => ({
            // `value` phải là ID (số) hoặc chuỗi ID
            value: medicine.id.toString(), 
            // `label` là tên hiển thị
            label: `${medicine.medicineName} (ID: ${medicine.id})`, 
        }));

        return [allOption, ...options];
    }, [medicineData]);

    // Hàm định dạng tiền tệ
    const formatCurrency = (amount) => {
        return `${amount.toLocaleString('vi-VN')} đ`;
    };

    // --- LOGIC GỌI API ---
    const fetchTransactionData = async () => {
        if (!year || isNaN(parseInt(year)) || parseInt(year) <= 0) {
            api.error({ message: 'Lỗi', description: 'Vui lòng nhập năm hợp lệ.' });
            return;
        }

        setLoading(true);
        setError(null);

        // Xây dựng URL API
        let apiUrl = `medicine-reports/monthly-transactions?year=${year}`;
        if (medicineId) {
            apiUrl += `&medicineId=${medicineId}`;
        }
            
        try {
            const response = await API.call().get(apiUrl); 
            
            // Xử lý response: API trả về mảng dữ liệu, cần đảm bảo 12 tháng
            const receivedData = response.data;
            const fullYearData = initialReportData.map(initialMonth => {
                const apiMonth = receivedData.find(d => d.month === initialMonth.month);
                return apiMonth || initialMonth;
            });

            setReportData(fullYearData);
            api.success({
                message: 'Tải dữ liệu thành công',
                description: `Báo cáo giao dịch năm ${year} đã được cập nhật.`,
            });

        } catch (err) {
            console.error("Lỗi khi fetch dữ liệu:", err);
            const errorMessage = "Không thể tải dữ liệu báo cáo. Vui lòng kiểm tra kết nối API.";
            setError(errorMessage);
            setReportData(initialReportData);
            api.error({
                message: 'Lỗi Tải Dữ Liệu',
                description: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    };

    // --- TÍNH TOÁN TỔNG KẾT ---
    const totalSummary = useMemo(() => {
        return reportData.reduce((acc, current) => {
            acc.totalImported += current.totalQuantityImported;
            acc.totalImportValue += current.totalValueImported;
            acc.totalSold += current.totalQuantitySold;
            acc.totalRevenue += current.totalRevenueSold;
            return acc;
        }, {
            totalImported: 0,
            totalImportValue: 0,
            totalSold: 0,
            totalRevenue: 0,
        });
    }, [reportData]);


    // --- CẤU HÌNH BIỂU ĐỒ ---
    const chartData = {
        labels: reportData.map(d => d.monthName),
        datasets: [
            {
                label: 'Số lượng NHẬP vào',
                data: reportData.map(d => d.totalQuantityImported),
                borderColor: 'rgb(54, 162, 235)', // Xanh dương
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                yAxisID: 'y',
            },
            {
                label: 'Số lượng BÁN ra',
                data: reportData.map(d => d.totalQuantitySold),
                borderColor: 'rgb(255, 99, 132)', // Đỏ
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                yAxisID: 'y',
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: `Giao dịch (Số lượng) theo tháng năm ${year} ${medicineId ? `(ID Thuốc: ${medicineId})` : '(Tất cả Thuốc)'}`,
            },
        },
        scales: {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                    display: true,
                    text: 'Số Lượng (Đơn vị)',
                },
            },
        },
    };

    // --- ĐỊNH NGHĨA CỘT BẢNG ---
    const columns = [
        {
            title: <CalendarOutlined />,
            dataIndex: 'monthName',
            key: 'monthName',
            width: 100,
            fixed: 'left',
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: 'SL Nhập',
            dataIndex: 'totalQuantityImported',
            key: 'totalQuantityImported',
            align: 'right',
            width: 120,
            render: (quantity) => <Text type="success">{quantity}</Text>,
        },
        {
            title: 'Giá trị Nhập',
            dataIndex: 'totalValueImported',
            key: 'totalValueImported',
            align: 'right',
            width: 150,
            render: (value) => formatCurrency(value),
        },
        {
            title: 'SL Bán',
            dataIndex: 'totalQuantitySold',
            key: 'totalQuantitySold',
            align: 'right',
            width: 120,
            render: (quantity) => <Text type="danger">{quantity}</Text>,
        },
        {
            title: 'Doanh thu Bán',
            dataIndex: 'totalRevenueSold',
            key: 'totalRevenueSold',
            align: 'right',
            width: 150,
            render: (value) => <Text mark>{formatCurrency(value)}</Text>,
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            {contextHolder}
            <Title level={2}>📊 Báo Cáo Giao Dịch Thuốc Hàng Tháng</Title>

            {/* --- 1. Vùng Lọc Dữ Liệu --- */}
            <Card style={{ marginBottom: 20 }}>
                <Space size="large">
                    <Space>
                        <Text strong>Năm:</Text>
                        <Input
                            placeholder="Ví dụ: 2025"
                            style={{ width: 120 }}
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            prefix={<CalendarOutlined />}
                        />
                    </Space>
                    <Space>
                        <Text strong>Chọn Thuốc:</Text>
                        {/* <<< THAY THẾ INPUT BẰNG SELECT >>> */}
                        <Select
                            showSearch
                            placeholder="Chọn thuốc hoặc để trống"
                            style={{ width: 250 }}
                            value={medicineId || ''} // Dùng '' cho tùy chọn "Tất cả"
                            onChange={(value) => setMedicineId(value)}
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={medicineOptions}
                        />
                    </Space>
                    <Button 
                        type="primary" 
                        icon={<SearchOutlined />} 
                        onClick={fetchTransactionData} 
                        loading={loading}
                    >
                        Xem Báo Cáo
                    </Button>
                </Space>
            </Card>

            {loading && <Spin tip="Đang tải dữ liệu..." style={{ display: 'block', margin: '40px auto' }} />}

            {/* --- 2. Tổng Kết Năm --- */}
            {!loading && (
                <>
                    <Title level={3}>📈 Tổng Kết Năm {year}</Title>
                    <Row gutter={16} style={{ marginBottom: 30 }}>
                        <Col span={6}>
                            <Card title="Tổng SL Nhập" bordered>
                                <Space>
                                    <PlusCircleOutlined style={{ color: 'green', fontSize: '20px' }} />
                                    <Text strong style={{ fontSize: 24, color: 'green' }}>
                                        {totalSummary.totalImported.toLocaleString('vi-VN')}
                                    </Text>
                                </Space>
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card title="Tổng Giá trị Nhập" bordered>
                                <Space>
                                    <DollarOutlined style={{ color: 'green', fontSize: '20px' }} />
                                    <Text strong style={{ fontSize: 24, color: 'green' }}>
                                        {formatCurrency(totalSummary.totalImportValue)}
                                    </Text>
                                </Space>
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card title="Tổng SL Bán" bordered>
                                <Space>
                                    <MinusCircleOutlined style={{ color: 'red', fontSize: '20px' }} />
                                    <Text strong style={{ fontSize: 24, color: 'red' }}>
                                        {totalSummary.totalSold.toLocaleString('vi-VN')}
                                    </Text>
                                </Space>
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card title="Tổng Doanh Thu Bán" bordered>
                                <Space>
                                    <DollarOutlined style={{ color: 'red', fontSize: '20px' }} />
                                    <Text strong style={{ fontSize: 24, color: 'red' }}>
                                        {formatCurrency(totalSummary.totalRevenue)}
                                    </Text>
                                </Space>
                            </Card>
                        </Col>
                    </Row>

                    {/* --- 3. Biểu Đồ (Chart) --- */}
                    <Card style={{ marginBottom: 30 }}>
                        <Line options={chartOptions} data={chartData} />
                    </Card>

                    {/* --- 4. Bảng Chi Tiết --- */}
                    <Title level={3}>📜 Chi Tiết Giao Dịch Từng Tháng</Title>
                    <Table
                        columns={columns}
                        dataSource={reportData}
                        rowKey="month"
                        pagination={false}
                        scroll={{ x: 750 }}
                        locale={{ emptyText: "Không có dữ liệu giao dịch cho năm đã chọn" }}
                    />
                </>
            )}
        </div>
    );
};

export default MonthlyTransactionReport;