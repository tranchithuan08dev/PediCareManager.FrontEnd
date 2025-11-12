import React, { useEffect, useState } from 'react';
import { 
    Table, 
    Button, 
    Modal, 
    Typography, 
    Space, 
    Tag, 
    notification,
    DatePicker, // Giữ DatePicker
} from 'antd';
import { FieldTimeOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css'; 
import { useDispatch, useSelector } from 'react-redux';
import { fetchGetAllUsers } from '../../store/userSlice'; 
import dayjs from 'dayjs'; 
import { fetchAttendanceReport } from '../../store/checkAttendanceSlice';


const { Title, Text } = Typography;


const calculateTotalHours = (shiftData) => {
    if (!shiftData || shiftData.length === 0) return 0;
    
    const total = shiftData.reduce((sum, currentShift) => {
        const hours = parseFloat(currentShift.totalHours);
        return sum + (isNaN(hours) ? 0 : hours);
    }, 0);

    return total.toFixed(2); 
};


const AttendanceDoctor = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [shiftHistory, setShiftHistory] = useState([]); 
    const [isLoadingShifts, setIsLoadingShifts] = useState(false); 
    const [api, contextHolder] = notification.useNotification(); 
    
    const [selectedDate, setSelectedDate] = useState(dayjs());

    const currentYear = selectedDate.year();
    const currentMonth = selectedDate.month() + 1; 
    
    const DUMMY_USER_LIST = useSelector((state) => state.USER.listUsers) 
    const dispatch = useDispatch();

    useEffect(()=> {
      dispatch(fetchGetAllUsers())
    },[dispatch]);

    const handleMonthChange = (date) => {
        setSelectedDate(date || dayjs());
    };


const handleViewShiftHistory = async (record) => {
        
        // Lấy năm và tháng TỪ STATE đã được chọn
        const year = selectedDate.year();
        const month = selectedDate.month() + 1; 
        const userId = record.id; // Lấy userId từ record
        
        // 🚀 Dữ liệu sẽ truyền vào Redux Thunk
        const dataReport = {
            userId: userId,
            year: year,
            month: month
        };

        // 🚀 Nếu selectedDate là không hợp lệ (ví dụ: người dùng xóa input nhưng không nhập lại)
        // Mặc dù Antd/Dayjs thường đặt nó về ngày hiện tại, ta vẫn nên kiểm tra cơ bản.
        if (!dayjs(selectedDate).isValid()) {
            api.error({
                message: 'Dữ liệu ngày tháng không hợp lệ',
                description: 'Vui lòng chọn hoặc nhập lại Tháng/Năm hợp lệ.',
            });
            return;
        }

        try {
            if (!record?.id) {
                api.error({
                    message: 'Thiếu thông tin',
                    description: 'Không có ID người dùng để xem lịch sử ca làm.',
                });
                return;
            }

            // Đặt người dùng được chọn và mở loading
            setSelectedUser(record);
            setIsLoadingShifts(true); 

            // 🚀 GỌI REDUX THUNK
            const resultAction = await dispatch(fetchAttendanceReport(dataReport));

            // Kiểm tra xem thunk có thành công không và lấy payload
            if (fetchAttendanceReport.fulfilled.match(resultAction)) {
                 // Dữ liệu ca làm được trả về từ payload của thunk
                const shiftData = resultAction.payload; 

                // Cập nhật lịch sử ca làm và mở modal
                setShiftHistory(shiftData);
                setIsModalVisible(true);
            } else if (fetchAttendanceReport.rejected.match(resultAction)) {
                // Xử lý lỗi từ thunk (thường là lỗi API)
                const error = resultAction.error.message || "Lỗi không xác định khi gọi API";
                api.error({
                    message: 'Lỗi API Redux',
                    description: `Không thể lấy dữ liệu ca làm cho tháng ${month}/${year}. Chi tiết: ${error}`,
                });
                setShiftHistory([]); 
            }
            

        } catch (error) {
            console.error("Lỗi khi xử lý lịch sử ca làm:", error);
            api.error({
                message: 'Lỗi Hệ Thống',
                description: 'Đã xảy ra lỗi không mong muốn trong quá trình xử lý.',
            });
            setShiftHistory([]); 
        } finally {
            setIsLoadingShifts(false); 
        }
    };


    // --- Định nghĩa Cột Bảng Lịch sử Ca làm (Giữ nguyên) ---
    const shiftHistoryColumns = [
        { title: 'ID Ca', dataIndex: 'id', key: 'id', width: 80 },
        { 
            title: 'Giờ Check In', 
            dataIndex: 'checkInTime', 
            key: 'checkInTime', 
            render: (time) => new Date(time).toLocaleString('vi-VN') 
        },
        { 
            title: 'Giờ Check Out', 
            dataIndex: 'checkOutTime', 
            key: 'checkOutTime', 
            render: (time) => time ? new Date(time).toLocaleString('vi-VN') : <Tag color="volcano">Chưa Check Out</Tag> 
        },
        { 
            title: 'Tổng Giờ', 
            dataIndex: 'totalHours', 
            key: 'totalHours', 
            width: 100, 
            render: (hours) => <Text strong>{hours}h</Text> 
        },
        { 
            title: 'Trạng Thái', 
            dataIndex: 'status', 
            key: 'status', 
            width: 120, 
            render: (status) => (
                <Tag color={status === 'Hoàn thành' ? 'green' : 'gold'}>
                    {status}
                </Tag>
            ) 
        },
    ];


    // --- Định nghĩa Cột Bảng Người dùng (Giữ nguyên) ---
    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
        { title: 'Họ và Tên', dataIndex: 'fullName', key: 'fullName', render: (text) => <Text strong>{text}</Text> },
        { title: 'Tên Đăng Nhập', dataIndex: 'username', key: 'username' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { 
            title: 'Vai Trò (Role)', 
            dataIndex: 'role', 
            key: 'role', 
            render: (role) => (
                <Tag color={role === 'Admin' ? 'geekblue' : role === 'Doctor' ? 'green' : 'orange'}>
                    {role.toUpperCase()}
                </Tag>
            ) 
        },
        {
            title: 'Hành Động',
            key: 'action',
            width: 180, 
            render: (_, record) => (
                <Button 
                    type="default" 
                    icon={<FieldTimeOutlined />} 
                    onClick={() => handleViewShiftHistory(record)} 
                    size="small"
                    loading={isLoadingShifts && selectedUser?.id === record.id} 
                >
                    Xem Lịch sử ca làm
                </Button>
            ),
        },
    ];

    const totalHoursCalculated = calculateTotalHours(shiftHistory);

    // --- Modal Hiển thị Lịch sử Ca làm ---
    const ShiftHistoryModal = () => (
        <Modal
            title={<Title level={4}>Lịch Sử Ca Làm: {selectedUser?.fullName}</Title>}
            open={isModalVisible} 
            onCancel={() => setIsModalVisible(false)} 
            footer={[
                <Button key="close" onClick={() => setIsModalVisible(false)}>
                    Đóng
                </Button>
            ]}
            width={1000} 
        >
            {/* Hiển thị tổng giờ làm */}
            <Title level={5}>
                Tổng Thời Gian Làm Việc trong tháng **{currentMonth}/{currentYear}**: <Text mark strong type="success">{totalHoursCalculated} giờ</Text>
            </Title>
            <p>
                <Text type="secondary">Danh sách ca làm chi tiết (Tháng {currentMonth}, Năm {currentYear}):</Text>
            </p>
            
            {/* Bảng lịch sử ca làm */}
            {isLoadingShifts ? (
                <Text>Đang tải dữ liệu ca làm...</Text>
            ) : (
                <Table 
                    columns={shiftHistoryColumns} 
                    dataSource={shiftHistory} 
                    rowKey="id" 
                    pagination={{ pageSize: 5 }} 
                    size="small"
                />
            )}
        </Modal>
    );


    return (
        <div style={{ padding: '24px' }}>
            {contextHolder}
            <Title level={3}>Danh Sách Bác Sĩ</Title>
            
            {/* 🚀 COMPONENT CHỌN THÁNG/NĂM - Cho phép nhập liệu */}
            <Space style={{ marginBottom: 16 }}>
                <Text strong>Chọn hoặc Nhập Tháng/Năm:</Text>
                <DatePicker 
                    picker="month" 
                    // Giá trị được kiểm soát bởi state Dayjs
                    value={selectedDate}
                    // Xử lý thay đổi
                    onChange={handleMonthChange}
                    // 🚀 Đặt format để người dùng biết cách nhập (MM/YYYY)
                    format="MM/YYYY" 
                    // 🚀 Cho phép người dùng nhập trực tiếp vào input
                    inputReadOnly={false} 
                />
            </Space>

            <Table 
                columns={columns} 
                dataSource={DUMMY_USER_LIST} 
                rowKey="id" 
                pagination={{ pageSize: 10 }} 
            />
            
            <ShiftHistoryModal />
        </div>
    );
};

export default AttendanceDoctor;