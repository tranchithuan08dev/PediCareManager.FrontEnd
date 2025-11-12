import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleOutlined, PrinterOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Layout, Space, Table, Typography, message } from 'antd';
import moment from 'moment';

const { Content, Header } = Layout;
const { Title } = Typography;

const ExaminationSuccessScreen = ({ payload, totalAmount }) => {
    const navigate = useNavigate();
    const componentRef = useRef();

    // Hàm xử lý in phiếu khám
    const handlePrint = () => {
        if (!componentRef.current) return;

        const printContent = componentRef.current.innerHTML;
        const printWindow = window.open('', '', 'height=600,width=800');

        printWindow.document.write('<html><head><title>Phiếu Khám Bệnh</title>');
        printWindow.document.write('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/antd/4.24.15/antd.min.css" />');
        printWindow.document.write('<style>@media print { .no-print { display: none; } } h4 { margin-top: 15px; }</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();

        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    // Thông báo lưu hồ sơ thành công
    message.success('Khám bệnh đã được lưu thành công!');

    return (
        <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            <Header style={{ background: '#001529', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={3} style={{ color: 'white', margin: 0 }}>
                    LƯU HỒ SƠ THÀNH CÔNG
                </Title>
                <Space className="no-print">
                    <Button
                        type="default"
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/dashboard')}
                    >
                        Quay Về Dashboard
                    </Button>
                </Space>
            </Header>

            <Content style={{ padding: '24px 24px' }}>
                <div ref={componentRef} style={{ maxWidth: 900, margin: '0 auto' }}>
                    <Card
                        style={{ textAlign: 'center' }}
                        title={<Title level={3} style={{ color: '#52c41a' }}><CheckCircleOutlined /> LƯU HỒ SƠ THÀNH CÔNG!</Title>}
                    >
                        <Descriptions bordered column={2} size="small" style={{ textAlign: 'left', marginBottom: 20 }}>
                            <Descriptions.Item label="Mã BN"><strong>{payload.patient.patientCode || 'N/A'}</strong></Descriptions.Item>
                            <Descriptions.Item label="Họ Tên BN"><strong>{payload.patient.fullName}</strong></Descriptions.Item>
                            <Descriptions.Item label="Ngày Khám" span={2}>{moment().format('HH:mm DD/MM/YYYY')}</Descriptions.Item>
                        </Descriptions>

                        <Card type="inner" title="Thông Tin Khám & Chẩn Đoán" headStyle={{ textAlign: 'left' }} style={{ textAlign: 'left', marginBottom: 20 }}>
                            <p><strong>Triệu chứng:</strong> {payload.medicalRecord.symptoms}</p>
                            <p><strong>Chẩn đoán:</strong> {payload.medicalRecord.diagnosis}</p>
                            <p><strong>Hướng dẫn điều trị:</strong> {payload.medicalRecord.treatment}</p>
                            <p><strong>Dị ứng thuốc:</strong> {payload.medicalRecord.drugAllergy || 'Không'}</p>
                            <p><strong>Ghi chú:</strong> {payload.medicalRecord.notes || 'Không'}</p>
                            <p><strong>Tái khám:</strong> {payload.medicalRecord.nextAppointmentDate || 'Không hẹn'}</p>
                        </Card>

                        <Card type="inner" title={`Đơn Thuốc (${payload.prescription.items.length} loại)`} headStyle={{ textAlign: 'left' }} style={{ textAlign: 'left', marginBottom: 20 }}>
                            <Table
                                columns={[
                                    { title: 'Thuốc', dataIndex: 'medicineName', key: 'medicineName' },
                                    { title: 'SL', dataIndex: 'quantity', key: 'quantity', width: 80 },
                                    { title: 'HDSD', dataIndex: 'usageInstruction', key: 'usageInstruction' },
                                ]}
                                dataSource={payload.prescription.items.map((item, index) => ({ ...item, key: index }))}
                                pagination={false}
                                size="small"
                                bordered
                            />
                            <div style={{ textAlign: 'right', marginTop: 10, fontSize: '1.2em', fontWeight: 'bold', color: '#08979c' }}>
                                TỔNG TIỀN THUỐC: {totalAmount.toLocaleString('vi-VN')}đ
                            </div>
                        </Card>

                        <Space className="no-print" style={{ marginTop: 20 }}>
                            <Button
                                type="primary"
                                icon={<PrinterOutlined />}
                                onClick={handlePrint}
                            >
                                In Phiếu Khám
                            </Button>
                        </Space>
                    </Card>
                </div>
            </Content>
        </Layout>
    );
};

export default ExaminationSuccessScreen;
