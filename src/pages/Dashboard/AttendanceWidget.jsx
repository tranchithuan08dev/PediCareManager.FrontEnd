import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCheckIn, fetchCheckOut, fetchCheckStatus } from "../../store/checkAttendanceSlice";
import { Button, Card, message, Spin, Typography, Divider, Row, Col } from "antd";
import { ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, LoginOutlined, LogoutOutlined, HistoryOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const AttendanceWidget = () => {
  const dispatch = useDispatch();
  const { checkstatus, loading } = useSelector((state) => state.checkAttendance);

  const [messageApi, contextHolder] = message.useMessage();
  const [currentTime, setCurrentTime] = useState(new Date());

  // 🕒 Cập nhật đồng hồ theo thời gian thực
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 🚀 Gọi API khi mở trang để xem trạng thái hiện tại
  useEffect(() => {
    dispatch(fetchCheckStatus());
  }, [dispatch]);

  // ✅ Check In
  const handleCheckIn = async () => {
    try {
      await dispatch(fetchCheckIn()).unwrap();
      messageApi.success("✅ Check In thành công!");
      dispatch(fetchCheckStatus());
    } catch (err) {
      messageApi.error(err?.message || "❌ Check In thất bại!");
    }
  };

  // ✅ Check Out
  const handleCheckOut = async () => {
    try {
      await dispatch(fetchCheckOut()).unwrap();
      messageApi.success("✅ Check Out thành công!");
      dispatch(fetchCheckStatus());
    } catch (err) {
      messageApi.error(err?.message || "❌ Check Out thất bại!");
    }
  };

  // Component nhỏ để hiển thị một mục trạng thái
  const StatusItem = ({ label, value, color, icon }) => (
    <div className="flex justify-between items-center py-2 border-b border-blue-100 last:border-b-0">
      <Text strong className="text-gray-600">
        {label}
      </Text>
      <Text className={`font-semibold ${color}`}>
        {icon} {value}
      </Text>
    </div>
  );

  return (
    <>
      {contextHolder}

      <div className="flex flex-col items-center mt-10 space-y-6">
        <Card
          className="w-[450px] shadow-2xl rounded-3xl p-6 bg-white border border-gray-100 transform hover:scale-[1.01] transition-transform duration-300"
          bodyStyle={{ padding: 0 }}
        >
          {/* Tiêu đề & Đồng hồ */}
          <div className="text-center mb-6 pt-2 pb-4 bg-blue-50/50 rounded-t-3xl border-b border-blue-100">
            <Title level={4} className="!mb-1 text-blue-800">
              ⏳ Bảng điều khiển điểm danh
            </Title>
            <Text className="text-gray-500 font-medium">
              Hôm nay: {currentTime.toLocaleDateString("vi-VN", { weekday: 'long', day: '2-digit', month: '2-digit' })}
            </Text>
            <Title level={2} className="!mt-2 !mb-0 text-blue-600 font-extrabold tracking-wider">
              {currentTime.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </Title>
          </div>

          <div className="p-5">
            {loading === "pending" ? (
              <div className="flex justify-center items-center py-10">
                <Spin tip="Đang tải dữ liệu..." size="large" />
              </div>
            ) : (
              <>
                {/* Chi tiết Trạng thái */}
                <div className="space-y-1 mb-6">
                  <StatusItem
                    label="Ca đang hoạt động"
                    value={checkstatus.activeShiftId ?? "Không có"}
                    color="text-indigo-600"
                    icon={<HistoryOutlined />}
                  />

                  <StatusItem
                    label="Giờ Check In"
                    value={
                      checkstatus.checkInTime
                        ? new Date(checkstatus.checkInTime).toLocaleString("vi-VN", { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                        : "Chưa có"
                    }
                    color={checkstatus.checkInTime ? "text-green-600" : "text-gray-500"}
                    icon={<LoginOutlined />}
                  />

                  {/* Trạng thái Quá hạn - Cải thiện hiển thị */}
                  <StatusItem
                    label="Trạng thái Quá hạn"
                    value={
                      checkstatus.isOverdue
                        ? "Có (Quên Check Out)"
                        : "Bình thường"
                    }
                    color={checkstatus.isOverdue ? "text-red-500" : "text-green-500"}
                    icon={checkstatus.isOverdue ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
                  />
                </div>

                {checkstatus.warningMessage && (
                  <div className="mb-6 p-3 bg-yellow-100 border border-yellow-300 rounded-lg text-yellow-800 text-center font-semibold">
                    ⚠️ {checkstatus.warningMessage}
                  </div>
                )}

                {/* Khu vực Nút bấm */}
                <Row gutter={16} className="mt-6">
                  <Col span={12}>
                    <Button
                      type="primary"
                      shape="round"
                      size="large"
                      block // Nút full-width
                      onClick={handleCheckIn}
                      icon={<LoginOutlined />}
                      className="!bg-green-500 hover:!bg-green-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Check In
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button
                      danger
                      shape="round"
                      size="large"
                      block // Nút full-width
                      onClick={handleCheckOut}
                      icon={<LogoutOutlined />}
                      className="!bg-red-500 hover:!bg-red-600 transition-all duration-200 shadow-lg hover:shadow-xl !text-white"
                    >
                      Check Out
                    </Button>
                  </Col>
                </Row>
              </>
            )}
          </div>
        </Card>
      </div>
    </>
  );
};

export default AttendanceWidget;