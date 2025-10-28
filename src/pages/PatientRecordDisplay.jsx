import React from 'react';
import { Card, Descriptions, Table, Typography, Layout, Divider } from 'antd';
import 'antd/dist/reset.css'; // Import CSS của Ant Design

const { Header, Content } = Layout;
const { Title } = Typography;

// Dữ liệu JSON bạn đã cung cấp
const medicalData = {
  patient: {
    patientCode: "BN-2222337-01345461",
    fullName: "Nguyễn Văn Mi8nh",
    dateOfBirth: "1990-03-15",
    gender: "male",
    address: "123 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh",
    representativeName: "Nguyễn Thị Hoa",
    representativePhone: "0905123456"
  },
  medicalRecord: {
    symptoms: "Ho khan, đau họng, mệt mỏi, sốt nhẹ 38.5°C trong 2 ngày",
    diagnosis: "Viêm họng cấp do virus",
    treatment: "Điều trị kháng viêm, hạ sốt, nghỉ ngơi, uống nhiều nước",
    notes: "Bệnh nhân có tiền sử dị ứng paracetamol, cần lưu ý khi kê thuốc",
    nextAppointmentDate: "2025-11-03",
    weightKg: 65.5,
    heightCm: 172.0,
    patientAgeAtVisit: 35,
    clinicalFindings: "Họng đỏ, không có mủ, phổi thông khí tốt, không ran",
    bodyTemperature: 38.5,
    heartRate: 88,
    respiratoryRate: 18,
    bmi: 22.1,
    bloodPressure: "120/80",
    drugAllergy: "Paracetamol"
  },
  prescription: {
    items: [
      {
        medicineId: 1,
        quantity: 10,
        dosage: "500mg",
        usageInstruction: "Uống 1 viên sau ăn, ngày 2 lần"
      },
      {
        medicineId: 2,
        quantity: 5,
        dosage: "10mg",
        usageInstruction: "Uống buổi tối trước khi ngủ 1 viên"
      }
    ]
  },
  createdBy: 1
};

// Định nghĩa cột cho Bảng Đơn thuốc
const prescriptionColumns = [
  {
    title: 'Mã Thuốc (ID)',
    dataIndex: 'medicineId',
    key: 'medicineId',
  },
  {
    title: 'Liều Lượng',
    dataIndex: 'dosage',
    key: 'dosage',
  },
  {
    title: 'Số Lượng',
    dataIndex: 'quantity',
    key: 'quantity',
  },
  {
    title: 'Hướng Dẫn Sử Dụng',
    dataIndex: 'usageInstruction',
    key: 'usageInstruction',
  },
];

const PatientRecordDisplay = () => {
  const { patient, medicalRecord, prescription } = medicalData;

  // Xử lý dữ liệu Bệnh nhân
  const patientItems = [
    { label: 'Mã Bệnh Nhân', children: patient.patientCode },
    { label: 'Họ Tên', children: patient.fullName },
    { label: 'Ngày Sinh', children: patient.dateOfBirth },
    { label: 'Giới Tính', children: patient.gender === 'male' ? 'Nam' : 'Nữ' },
    { label: 'Tuổi', children: medicalRecord.patientAgeAtVisit },
    { label: 'Địa Chỉ', children: patient.address, span: 2 },
    { label: 'Người Đại Diện', children: patient.representativeName },
    { label: 'SĐT Đại Diện', children: patient.representativePhone },
  ];

  // Xử lý dữ liệu Hồ sơ Y tế (chia thành 2 nhóm: Tổng quan và Chỉ số sinh tồn)
  const medicalOverviewItems = [
    { label: 'Triệu Chứng', children: medicalRecord.symptoms, span: 3 },
    { label: 'Chẩn Đoán', children: medicalRecord.diagnosis, span: 3 },
    { label: 'Điều Trị', children: medicalRecord.treatment, span: 3 },
    { label: 'Dị Ứng Thuốc', children: medicalRecord.drugAllergy, span: 3 },
    { label: 'Ghi Chú Đặc Biệt', children: medicalRecord.notes, span: 3 },
    { label: 'Ngày Tái Khám', children: medicalRecord.nextAppointmentDate },
  ];
  
  const vitalSignsItems = [
    { label: 'Cân Nặng (kg)', children: medicalRecord.weightKg },
    { label: 'Chiều Cao (cm)', children: medicalRecord.heightCm },
    { label: 'BMI', children: medicalRecord.bmi },
    { label: 'Huyết Áp', children: medicalRecord.bloodPressure },
    { label: 'Nhiệt Độ (°C)', children: medicalRecord.bodyTemperature },
    { label: 'Nhịp Tim (bpm)', children: medicalRecord.heartRate },
    { label: 'Nhịp Thở (lần/phút)', children: medicalRecord.respiratoryRate },
    { label: 'Khám Lâm Sàng', children: medicalRecord.clinicalFindings, span: 2 },
  ];

  return (
    <Layout>
      <Header style={{ background: '#001529', padding: 0 }}>
        <Title level={3} style={{ color: 'white', lineHeight: '64px', marginLeft: 20 }}>
          Hồ Sơ Khám Bệnh 🧑‍⚕️
        </Title>
      </Header>
      <Content style={{ padding: '24px 50px', background: '#f0f2f5' }}>
        <div className="site-layout-content" style={{ padding: 24, background: '#fff' }}>

          {/* 1. Thông tin Bệnh nhân */}
          <Card title="Thông Tin Bệnh Nhân" style={{ marginBottom: 24 }}>
            <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }} items={patientItems} />
          </Card>

          {/* 2. Hồ sơ Y tế */}
          <Card title="Hồ Sơ Y Tế (Khám Lâm Sàng)" style={{ marginBottom: 24 }}>
            <Title level={5}>Chỉ Số Sinh Tồn</Title>
            <Descriptions bordered column={{ xs: 1, sm: 2, md: 4 }} items={vitalSignsItems} />
            
            <Divider />
            
            <Title level={5}>Kết Quả Khám và Điều Trị</Title>
            <Descriptions bordered column={3} items={medicalOverviewItems} />
          </Card>

          {/* 3. Đơn Thuốc */}
          <Card title="Đơn Thuốc Đã Kê" style={{ marginBottom: 24 }}>
            <Table
              columns={prescriptionColumns}
              dataSource={prescription.items.map((item, index) => ({ ...item, key: index }))} // Thêm key
              pagination={false}
              bordered
            />
          </Card>

        </div>
      </Content>
    </Layout>
  );
};

export default PatientRecordDisplay;