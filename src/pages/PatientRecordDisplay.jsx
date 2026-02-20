import React from 'react';
import { Card, Descriptions, Table, Typography, Layout, Divider } from 'antd';
import 'antd/dist/reset.css'; // Import CSS của Ant Design

const { Header, Content } = Layout;
const { Title } = Typography;


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