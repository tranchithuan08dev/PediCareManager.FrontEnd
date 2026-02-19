import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleOutlined, PrinterOutlined, ArrowLeftOutlined, UserOutlined, MedicineBoxOutlined, CalendarOutlined } from '@ant-design/icons';
import { Button, Card, Layout, Space, Typography, Tag, Divider, Row, Col } from 'antd';
import moment from 'moment';

const { Content, Header } = Layout;
const { Title, Text } = Typography;

const ExaminationSuccessScreen = ({ payload, totalAmount, medicationDays }) => {
    const navigate = useNavigate();
    const componentRef = useRef();

    const handlePrint = () => {
        if (!componentRef.current) return;
        const printContent = componentRef.current.innerHTML;
        const printWindow = window.open('', '', 'height=800,width=900');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Phiếu Khám Bệnh</title>
                <meta charset="UTF-8">
                <style>
                    @page { size: A4; margin: 12mm 15mm; }
                    * { box-sizing: border-box; }
                    body { font-family: 'Times New Roman', Times, serif; font-size: 13px; line-height: 1.5; color: #000; margin: 0; padding: 10px; }
                    .prescription-header { text-align: center; margin-bottom: 12px; border-bottom: 2px solid #000; padding-bottom: 8px; }
                    .prescription-header h2 { margin: 2px 0; font-size: 13px; font-weight: bold; text-transform: uppercase; }
                    .prescription-header h1 { margin: 4px 0; font-size: 15px; font-weight: bold; text-transform: uppercase; }
                    .prescription-header p { margin: 2px 0; font-size: 11px; }
                    .prescription-title { text-align: center; font-size: 18px; font-weight: bold; margin: 12px 0; text-transform: uppercase; letter-spacing: 1px; }
                    .patient-info { margin: 10px 0; }
                    .patient-info p { margin: 4px 0; font-size: 13px; }
                    .section-title { font-weight: bold; font-size: 14px; margin: 12px 0 6px 0; text-transform: uppercase; border-bottom: 1px solid #333; padding-bottom: 3px; }
                    .diagnosis-section { margin: 8px 0; padding: 6px 8px; background: #f9f9f9; }
                    .diagnosis-section p { margin: 4px 0; font-size: 13px; }
                    .medicine-table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 12px; }
                    .medicine-table th, .medicine-table td { border: 1px solid #000; padding: 5px 6px; text-align: left; }
                    .medicine-table th { background-color: #e8e8e8; font-weight: bold; text-align: center; font-size: 12px; }
                    .medicine-table td:nth-child(1) { text-align: center; width: 40px; }
                    .medicine-table td:nth-child(3) { text-align: center; width: 50px; }
                    .medicine-table td:nth-child(4) { text-align: center; width: 60px; }
                    .note-box { margin-top: 8px; padding: 6px 8px; border: 1px dashed #666; font-style: italic; font-size: 12px; }
                    .note-box p { margin: 3px 0; }
                    .footer-section { margin-top: 20px; display: flex; justify-content: flex-end; }
                    .signature-box { text-align: center; width: 48%; }
                    .signature-box p { margin: 3px 0; font-style: italic; font-size: 12px; }
                    .signature-space { height: 55px; }
                    .doctor-name { font-weight: bold; text-transform: uppercase; font-size: 13px; }
                    @media print { .no-print { display: none !important; } body { padding: 0; } }
                </style>
            </head>
            <body>
        `);
        printWindow.document.write(printContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
    };

    const calculateAge = (dob) => {
        if (!dob) return 'N/A';
        const birthDate = moment(dob, 'YYYY-MM-DD');
        const now = moment();
        const years = now.diff(birthDate, 'years');
        if (years >= 1) return `${years} tuổi`;
        const months = now.diff(birthDate, 'months');
        if (months >= 1) return `${months} tháng`;
        return `${now.diff(birthDate, 'days')} ngày`;
    };

    const items = payload.prescriptionItems || payload.prescription?.items || [];
    const patient = payload.patient;
    const record = payload.medicalRecord;

    return (
        <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            {/* HEADER */}
            <Header style={{
                background: 'linear-gradient(135deg, #003a8c 0%, #1677ff 100%)',
                padding: '0 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 12px rgba(0,0,0,0.18)'
            }}>
                <Space>
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 22 }} />
                    <Title level={3} style={{ color: 'white', margin: 0, letterSpacing: 1 }}>
                        LƯU HỒ SƠ THÀNH CÔNG
                    </Title>
                </Space>
                <Space className="no-print">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/dashboard')}
                        style={{ borderRadius: 6 }}
                    >
                        Quay về Dashboard
                    </Button>
                    <Button
                        type="primary"
                        icon={<PrinterOutlined />}
                        onClick={handlePrint}
                        style={{ borderRadius: 6, background: '#52c41a', borderColor: '#52c41a' }}
                    >
                        In Phiếu Khám
                    </Button>
                </Space>
            </Header>

            <Content style={{ padding: '24px' }}>

                {/* PREVIEW CARD TRÊN MÀN HÌNH */}
                <div className="no-print" style={{ maxWidth: 900, margin: '0 auto 20px auto' }}>
                    <Card
                        style={{
                            borderRadius: 12,
                            border: 'none',
                            background: 'linear-gradient(135deg, #f6ffed 0%, #e6f7ff 100%)',
                            boxShadow: '0 4px 20px rgba(22,119,255,0.1)'
                        }}
                        bodyStyle={{ padding: '16px 24px' }}
                    >
                        <Row align="middle" gutter={16}>
                            <Col>
                                <CheckCircleOutlined style={{ fontSize: 40, color: '#52c41a' }} />
                            </Col>
                            <Col flex={1}>
                                <Title level={4} style={{ color: '#237804', margin: 0 }}>Hồ sơ khám bệnh đã được lưu thành công!</Title>
                                <Text style={{ color: '#555' }}>
                                    Phiếu khám bên dưới đã sẵn sàng để in. Nhấn <strong>In Phiếu Khám</strong> để in cho bệnh nhân.
                                </Text>
                            </Col>
                            <Col>
                                <Tag color="blue" style={{ fontSize: 13, padding: '4px 12px', borderRadius: 20 }}>
                                    {moment().format('HH:mm - DD/MM/YYYY')}
                                </Tag>
                            </Col>
                        </Row>
                    </Card>
                </div>

                {/* NỘI DUNG PHIẾU KHÁM — sẽ được in */}
                <div
                    ref={componentRef}
                    style={{
                        maxWidth: 900,
                        margin: '0 auto',
                        background: '#fff',
                        padding: '28px 36px',
                        borderRadius: 10,
                        boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
                        border: '1px solid #e8e8e8'
                    }}
                >
                    {/* HEADER PHÒNG KHÁM */}
                    <div className="prescription-header" style={{ textAlign: 'center', borderBottom: '2px solid #003a8c', paddingBottom: 12, marginBottom: 14 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: '#555' }}>Sở Y Tế Tỉnh Đồng Tháp</div>
                        <div style={{ fontSize: 17, fontWeight: 800, textTransform: 'uppercase', color: '#003a8c', margin: '4px 0' }}>
                            Phòng Khám Chuyên Khoa Nhi
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 700, textTransform: 'uppercase', color: '#003a8c' }}>
                            Bác Sĩ Trần Chí Thành
                        </div>
                        <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>
                            310 - Đường 30/4 - Phường Cai Lậy - Tỉnh Đồng Tháp
                        </div>
                        <div style={{ fontSize: 12, color: '#555' }}>
                            ĐT: 0377174439 &nbsp;|&nbsp; Email: bsnhi.chithanh@gmail.com
                        </div>
                    </div>

                    {/* TIÊU ĐỀ */}
                    <div style={{ textAlign: 'center', fontSize: 20, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, margin: '14px 0 18px', color: '#003a8c' }}>
                        Phiếu Khám Bệnh
                    </div>

                    {/* THÔNG TIN BỆNH NHÂN */}
                    <div style={{
                        background: '#f8faff',
                        border: '1px solid #d0e4ff',
                        borderRadius: 8,
                        padding: '12px 16px',
                        marginBottom: 14
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <UserOutlined style={{ color: '#1677ff' }} />
                            <span style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', color: '#003a8c' }}>Thông Tin Bệnh Nhân</span>
                        </div>
                        <Row gutter={[8, 4]}>
                            <Col span={12}>
                                <Text><strong>Mã BN:</strong> {patient.patientCode || 'N/A'}</Text>
                            </Col>
                            <Col span={12}>
                                <Text><strong>Ngày khám:</strong> {moment().format('DD/MM/YYYY')}</Text>
                            </Col>
                            <Col span={24}>
                                <Text style={{ fontSize: 14 }}><strong>Họ và tên:</strong> {patient.fullName}</Text>
                            </Col>
                            <Col span={8}>
                                <Text><strong>Tuổi:</strong> {calculateAge(patient.dateOfBirth)}</Text>
                            </Col>
                            <Col span={8}>
                                <Text><strong>Giới tính:</strong> {patient.gender === 'male' ? 'Nam' : 'Nữ'}</Text>
                            </Col>
                            <Col span={8}>
                                <Text><strong>Ngày sinh:</strong> {patient.dateOfBirth ? moment(patient.dateOfBirth, 'YYYY-MM-DD').format('DD/MM/YYYY') : 'N/A'}</Text>
                            </Col>
                            <Col span={24}>
                                <Text><strong>Địa chỉ:</strong> {patient.address || 'Không có thông tin'}</Text>
                            </Col>
                            {record.drugAllergy && (
                                <Col span={24}>
                                    <Text style={{ color: '#cf1322' }}><strong>⚠ Tiền sử:</strong> {record.drugAllergy}</Text>
                                </Col>
                            )}
                        </Row>
                    </div>

                    {/* CHẨN ĐOÁN — chỉ hiển thị chẩn đoán */}
                    <div style={{
                        background: '#fffbe6',
                        border: '1px solid #ffe58f',
                        borderRadius: 8,
                        padding: '10px 16px',
                        marginBottom: 14
                    }}>
                        <div style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', color: '#874d00', marginBottom: 4 }}>
                            I. Chẩn Đoán
                        </div>
                        <Text style={{ fontSize: 14 }}>{record.diagnosis}</Text>
                    </div>

                    {/* ĐƠN THUỐC */}
                    <div style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <MedicineBoxOutlined style={{ color: '#1677ff' }} />
                                <span style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', color: '#003a8c' }}>II. Đơn Thuốc</span>
                            </div>
                            {medicationDays && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <CalendarOutlined style={{ color: '#52c41a' }} />
                                    <span style={{ fontWeight: 700, color: '#237804', fontSize: 13 }}>
                                        Số ngày dùng thuốc: {medicationDays} ngày
                                    </span>
                                </div>
                            )}
                        </div>

                        <table className="medicine-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead>
                                <tr style={{ background: '#e6f0ff' }}>
                                    <th style={{ border: '1px solid #b0c8f0', padding: '7px 8px', textAlign: 'center', width: 42, fontWeight: 700 }}>STT</th>
                                    <th style={{ border: '1px solid #b0c8f0', padding: '7px 8px', fontWeight: 700 }}>Tên thuốc</th>
                                    <th style={{ border: '1px solid #b0c8f0', padding: '7px 8px', textAlign: 'center', width: 55, fontWeight: 700 }}>SL</th>
                                    <th style={{ border: '1px solid #b0c8f0', padding: '7px 8px', textAlign: 'center', width: 70, fontWeight: 700 }}>Số ngày</th>
                                    <th style={{ border: '1px solid #b0c8f0', padding: '7px 8px', fontWeight: 700 }}>Cách dùng</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={index} style={{ background: index % 2 === 0 ? '#fff' : '#f8faff' }}>
                                        <td style={{ border: '1px solid #d0e4ff', padding: '6px 8px', textAlign: 'center', color: '#555' }}>{index + 1}</td>
                                        <td style={{ border: '1px solid #d0e4ff', padding: '6px 8px', fontWeight: 600 }}>{item.medicineName}</td>
                                        <td style={{ border: '1px solid #d0e4ff', padding: '6px 8px', textAlign: 'center', fontWeight: 700, color: '#1677ff' }}>{item.quantity}</td>
                                        <td style={{ border: '1px solid #d0e4ff', padding: '6px 8px', textAlign: 'center', fontWeight: 700, color: '#237804' }}>
                                            {medicationDays ? `${medicationDays} ngày` : '—'}
                                        </td>
                                        <td style={{ border: '1px solid #d0e4ff', padding: '6px 8px', color: '#444' }}>{item.usageInstruction}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* GHI CHÚ & TÁI KHÁM */}
                    {(record.notes || record.nextAppointmentDate) && (
                        <div className="note-box" style={{
                            border: '1px dashed #aaa',
                            borderRadius: 6,
                            padding: '8px 14px',
                            marginBottom: 16,
                            background: '#fafafa'
                        }}>
                            {record.notes && (
                                <p style={{ margin: '3px 0', fontStyle: 'italic', fontSize: 13 }}>
                                    <strong>Ghi chú:</strong> {record.notes}
                                </p>
                            )}
                            {record.nextAppointmentDate && (
                                <p style={{ margin: '3px 0', fontStyle: 'italic', fontSize: 13 }}>
                                    <strong>Ngày tái khám:</strong> {moment(record.nextAppointmentDate, 'YYYY-MM-DD').format('DD/MM/YYYY')}
                                </p>
                            )}
                        </div>
                    )}

                    {/* CHỮ KÝ — chỉ bác sĩ */}
                    <div className="footer-section" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                        <div style={{ textAlign: 'center', width: '48%' }}>
                            <p style={{ margin: '3px 0', fontStyle: 'italic', fontSize: 12 }}>
                                Ngày {moment().format('DD')} tháng {moment().format('MM')} năm {moment().format('YYYY')}
                            </p>
                            <p style={{ margin: '3px 0', fontWeight: 700, fontSize: 13 }}>Bác sĩ khám bệnh</p>
                            <p style={{ margin: '3px 0', fontStyle: 'italic', fontSize: 12 }}>(Ký và ghi rõ họ tên)</p>
                            <div style={{ height: 55 }}></div>
                            <p style={{ margin: '3px 0', fontWeight: 800, textTransform: 'uppercase', fontSize: 13 }}>BS. TRẦN CHÍ THÀNH</p>
                        </div>
                    </div>
                </div>
            </Content>
        </Layout>
    );
};

export default ExaminationSuccessScreen;