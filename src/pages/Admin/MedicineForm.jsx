import React from 'react';
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Button,
  Col,
  Row,
  Typography,
  message,
  Card,
} from 'antd';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCreateMedicine } from '../../store/medicineSlice';

const { Title, Text } = Typography;

const MedicineForm = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state?.AUTH?.currentuser) || {};
  const [msgApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm(); // 👈 tạo form instance

  const onFinish = async (values) => {
    try {
      const createdByUserId = currentUser?.id ?? null;

      const formattedValues = {
        ...values,
        createdByUserId,
        expiryDate: values.expiryDate
          ? values.expiryDate.format('YYYY-MM-DD')
          : null,
      };

      console.log('Received values of form:', formattedValues);

      const resultAction = await dispatch(fetchCreateMedicine(formattedValues));

      if (fetchCreateMedicine.fulfilled.match(resultAction)) {
        msgApi.success('🎉 Thêm thuốc thành công!');

        // ✅ Reset lại toàn bộ input sau khi lưu thành công
        form.resetFields();

        // ✅ Focus lại vào ô đầu tiên
        const firstInput = document.querySelector('input[name="medicineName"]');
        if (firstInput) firstInput.focus();
      } else {
        msgApi.error('❌ Không thể thêm thuốc. Vui lòng thử lại!');
      }
    } catch (error) {
      console.error('Lỗi khi tạo thuốc:', error);
      msgApi.error('⚠️ Đã xảy ra lỗi trong quá trình xử lý.');
    }
  };

  const MAX_QUANTITY = 2147483647;

  return (
    <div
      style={{
        maxWidth: 900,
        margin: '40px auto',
        padding: '0 20px',
      }}
    >
      {contextHolder}
      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          padding: 30,
          background: '#fff',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <Title level={3} style={{ color: '#1890ff', marginBottom: 0 }}>
            💊 Thêm Mới Thuốc
          </Title>
          <Text type="secondary">
            Nhập thông tin chi tiết về thuốc vào các trường bên dưới
          </Text>
        </div>

        <Form
          form={form} // 👈 gắn instance vào form
          layout="vertical"
          name="medicine_import_form"
          onFinish={onFinish}
          initialValues={{
            importQuantity: 1,
            importUnitPrice: 0,
            priceSell: 0,
            expiryDate: dayjs().add(1, 'year'),
            createdByUserId: 0,
          }}
          scrollToFirstError
        >
          {/* Hàng 1 */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="medicineName"
                label="Tên Thuốc"
                rules={[{ required: true, message: 'Vui lòng nhập tên thuốc!' }]}
              >
                <Input placeholder="Ví dụ: Paracetamol" name="medicineName" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="category"
                label="Loại (Category)"
                rules={[{ required: true, message: 'Vui lòng nhập loại thuốc!' }]}
              >
                <Input placeholder="Ví dụ: Kháng sinh, Giảm đau" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="unit"
                label="Đơn vị"
                rules={[{ required: true, message: 'Vui lòng nhập đơn vị!' }]}
              >
                <Input placeholder="Ví dụ: Viên, Hộp, Chai" />
              </Form.Item>
            </Col>
          </Row>

          {/* Hàng 2 */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="priceSell"
                label="Giá Bán (VND)"
                rules={[{ required: true, message: 'Vui lòng nhập giá bán!' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(v) => v.replace(/,/g, '')}
                  placeholder="Giá bán"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="expiryDate"
                label="Hạn Sử Dụng"
                rules={[{ required: true, message: 'Vui lòng chọn hạn sử dụng!' }]}
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="supplier"
                label="Nhà Cung Cấp"
                rules={[{ required: true, message: 'Vui lòng nhập nhà cung cấp!' }]}
              >
                <Input placeholder="Ví dụ: Công ty Dược A" />
              </Form.Item>
            </Col>
          </Row>

          {/* Hàng 3 */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="importQuantity"
                label="Số Lượng Nhập"
                rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  max={MAX_QUANTITY}
                  precision={0}
                  placeholder="Số lượng nhập"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="importUnitPrice"
                label="Đơn Giá Nhập (VND)"
                rules={[{ required: true, message: 'Vui lòng nhập đơn giá nhập!' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0.01}
                  step={0.01}
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(v) => v.replace(/,/g, '')}
                  placeholder="Đơn giá nhập"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Trường ẩn */}
          <Form.Item name="createdByUserId" hidden>
            <Input type="hidden" />
          </Form.Item>

          {/* Nút lưu */}
          <Form.Item style={{ textAlign: 'center', marginTop: 20 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              style={{
                width: '60%',
                borderRadius: 8,
                background: '#1890ff',
                fontWeight: 500,
              }}
            >
              💾 Lưu Thông Tin Thuốc
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default MedicineForm;
