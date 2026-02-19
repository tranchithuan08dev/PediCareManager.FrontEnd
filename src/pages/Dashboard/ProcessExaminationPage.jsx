import React, { useState, useEffect } from 'react';
import { 
    Card, Descriptions, Typography, Layout, Row, Col, 
    Button, Form, Input, InputNumber, Select, Space, Table, Alert, 
    Divider, DatePicker, message, Modal,
    Collapse 
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { 
    UserOutlined, HeartOutlined, HistoryOutlined, PlusOutlined, DeleteOutlined, SaveOutlined, MedicineBoxOutlined, SearchOutlined,
    EditOutlined // ⭐️ Icon cho Chỉnh sửa
} from '@ant-design/icons';
// Lưu ý: Trong môi trường thực tế, bạn chỉ cần import CSS một lần ở file gốc
import 'antd/dist/reset.css'; 
import moment from 'moment';
import {  fetchGetAllMedicineProcessExamination } from '../../store/medicineSlice';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGetListPatientSearch, fetchGetPatientHistory } from '../../store/patientSlice';
import { fetchPostExamination } from '../../store/examinationSlice';
import ExaminationSuccessScreen from './ExaminationSuccessScreen';

const { Header, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Panel } = Collapse; 



const initialPatientData = {
    id: null,
    patientCode: null,
    fullName: null, 
    dateOfBirth: null,
    gender: null,
    phone: null,
    address: null,
    representativeName: null,
    representativePhone: null,
    patientAgeAtVisit: 0,
};

// --- Cấu hình cột cho bảng đơn thuốc (CẬP NHẬT: Thêm cột và tính Thành tiền) ---
const prescriptionColumns = (onDeleteMedicine, onEditMedicine, editingKey) => [
    { title: 'Thuốc', dataIndex: 'medicineName', key: 'medicineName' },
    { title: 'Đơn vị', dataIndex: 'unit', key: 'unit', width: 80 }, 
    { 
        title: 'ĐG', 
        dataIndex: 'priceSell', 
        key: 'priceSell', 
        width: 80, 
        render: (text) => `${text?.toLocaleString('vi-VN') || 0}đ` 
    }, 
    { title: 'SL', dataIndex: 'quantity', key: 'quantity', width: 60 },
    { 
        title: 'Thành tiền', 
        key: 'totalPrice', 
        width: 100,
        // Tính thành tiền: priceSell * quantity
        render: (_, record) => `${((record.quantity || 0) * (record.priceSell || 0)).toLocaleString('vi-VN')}đ` 
    }, 
    { title: 'Liều/Cách dùng', dataIndex: 'usageInstruction', key: 'usageInstruction' },
    {
        title: 'Hành động',
        key: 'action',
        width: 100,
        render: (_, record) => (
            <Space size="small">
                <Button 
                    type="link" 
                    icon={<EditOutlined />} 
                    size="small"
                    onClick={() => onEditMedicine(record)} 
                    // Vô hiệu hóa khi đang chỉnh sửa mục khác hoặc mục hiện tại
                    disabled={editingKey !== null && editingKey !== record.key} 
                >
                    {editingKey === record.key ? "..." : ""}
                </Button>
                <Button 
                    danger 
                    icon={<DeleteOutlined />} 
                    size="small"
                    onClick={() => onDeleteMedicine(record.key)}
                    disabled={editingKey !== null} // Vô hiệu hóa khi đang chỉnh sửa
                />
            </Space>
        ),
    },
];

// --- Hàm hỗ trợ ---
const calculateAge = (dob) => {
    if (!dob) return "N/A";
    return moment().diff(moment(dob, 'YYYY-MM-DD'), 'years');
};

const formatUsageInstruction = (dosage, note) => {
    const parts = [];
    if (dosage.morning > 0) parts.push(`Sáng: ${dosage.morning} viên`);
    if (dosage.noon > 0) parts.push(`Trưa: ${dosage.noon} viên`);
    if (dosage.afternoon > 0) parts.push(`Chiều: ${dosage.afternoon} viên`);
    if (dosage.evening > 0) parts.push(`Tối: ${dosage.evening} viên`);

    const totalDose = (dosage.morning || 0) + (dosage.noon || 0) + (dosage.afternoon || 0) + (dosage.evening || 0);
    
    let instruction = parts.length > 0
        ? `Uống ${totalDose} viên/ngày. Phân liều: ${parts.join(', ')}.`
        : "Uống theo chỉ định.";

    if (note) instruction += ` Hướng dẫn: ${note}`;
    return instruction.trim();
};

// --- Modal Tìm kiếm Bệnh nhân (Giữ nguyên) ---
const PatientSearchModal = ({ isVisible, onClose, searchResults, onSelectPatient, onInputNewPatient, searchName }) => {
    const columns = [
        { title: 'Mã BN', dataIndex: 'patientCode', key: 'patientCode', render: text => text || "Chưa có Mã" },
        { title: 'Họ Tên', dataIndex: 'fullName', key: 'fullName' },
        { title: 'Ngày Sinh', dataIndex: 'dateOfBirth', key: 'dateOfBirth', render: text => text || "N/A" },
        { title: 'Địa chỉ', dataIndex: 'address', key: 'address' },
        {
            title: 'Chọn',
            key: 'action',
            render: (_, record) => (
                <Button type="primary" size="small" onClick={() => onSelectPatient(record)}>Chọn</Button>
            ),
        },
    ];

    return (
        <Modal
            title={<><SearchOutlined /> Kết Quả Tìm Kiếm Bệnh Nhân</>}
            open={isVisible}
            onCancel={onClose}
            width={800}
            footer={[
                <Button key="close" onClick={onClose}>Đóng</Button>,
                <Button key="new" danger type="dashed" onClick={() => onInputNewPatient(searchName)}>
                    Nhập Bệnh Nhân Mới
                </Button>,
            ]}
        >
            <Table 
                columns={columns} 
                dataSource={searchResults.map(p => ({ ...p, key: p.id }))} 
                pagination={{ pageSize: 5 }} 
                size="small"
                locale={{ emptyText: "Không tìm thấy bệnh nhân nào khớp." }}
            />
        </Modal>
    );
};

// --- COMPONENT LỊCH SỬ TOA THUỐC CŨ (Giữ nguyên) ---
const OldPrescriptionHistory = ({ history }) => {
    if (history.length === 0) {
        return <Alert message="Chưa có lịch sử kê đơn cho bệnh nhân này." type="info" showIcon />;
    }

    const columns = [
        { title: 'Thuốc', dataIndex: 'medicineName', key: 'medicineName' },
        { title: 'SL', dataIndex: 'quantity', key: 'quantity', width: 60 },
        { title: 'Liều/Cách dùng', dataIndex: 'usageInstruction', key: 'usageInstruction', width: 300 },
    ];

    const items = [...history]
        .sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate)) 
        .map((record, index) => ({
            key: record.medicalRecordId,
            label: (
                <Space size={10}>
                    <HistoryOutlined />
                    <strong style={{ minWidth: 120 }}>{moment(record.visitDate).format('HH:mm DD/MM/YYYY')}</strong>
                    <span style={{ color: '#0050b3' }}>| **BS:** {record.doctorName}</span>
                    <span style={{ color: '#595959' }}>| **Chẩn đoán:** {record.diagnosis}</span>
                </Space>
            ),
            children: (
                <>
                    <Table 
                        columns={columns} 
                        dataSource={record.prescriptionItems.map((item, i) => ({ ...item, key: i }))}
                        pagination={false}
                        size="small"
                        bordered
                    />
                </>
            ),
            showArrow: true,
        }));

    return (
        <Card 
            title={<><HistoryOutlined /> Lịch Sử Khám Bệnh & Kê Đơn Cũ ({history.length} lần)</>} 
            size="small"
            style={{ marginTop: 16 }}
            headStyle={{ borderBottom: '1px solid #e8e8e8', fontWeight: 'bold' }}
            bodyStyle={{ padding: '0px 0px 10px 0px' }}
        >
            <Collapse 
                items={items}
                defaultActiveKey={history.length > 0 ? [history[0].medicalRecordId] : []} 
                size="small"
                bordered={false}
                style={{ background: '#fff' }}
            />
        </Card>
    );
};


// --- Component chính: PatientExaminationForm ---
const PatientExaminationForm = () => {
    const [form] = Form.useForm(); 
    const [medicineForm] = Form.useForm(); 
    const [searchKeyword, setSearchKeyword] = useState(null);
     const [patientCodeKeyword, setPatientCodeKeyword] = useState(null);
    const [isNewPatientMode, setIsNewPatientMode] = useState(false);
    const [currentPatient, setCurrentPatient] = useState(initialPatientData);
    const [prescriptionItems, setPrescriptionItems] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [searchName, setSearchName] = useState("");
    const [medicalHistory, setMedicalHistory] = useState([]); 
    const [messageApi, contextHolder] = message.useMessage();
    // ⭐️ BỔ SUNG STATE FLAG: Theo dõi trạng thái tìm kiếm đã được khởi tạo
    const [searchInitiated, setSearchInitiated] = useState(false); 
    const [successPayload, setSuccessPayload] = useState(null); 
    const navigate = useNavigate();
    //GỌI HÀM Ở ĐÂY
    const mockMedicines = useSelector((state)=> state?.MEDICINE?.listMedicineProcessExamination) || []; 
    const results = useSelector((state)=> state?.PATIENT?.listSearch) || []; 
    const history = useSelector((state)=> state?.PATIENT?.patientHistory) || []; 
     const currentUser = useSelector((state)=> state?.AUTH?.currentuser) || []; 
  
    const dispatch = useDispatch();
    
    // 1. useEffect GỌI API (giữ nguyên logic gốc)
    useEffect(()=>{
        dispatch(fetchGetAllMedicineProcessExamination())
        if (searchKeyword != null) {
             dispatch(fetchGetListPatientSearch(searchKeyword))
        }
        if (patientCodeKeyword != null) {
              dispatch(fetchGetPatientHistory(patientCodeKeyword))
        }
       
    },[searchKeyword,dispatch,patientCodeKeyword])

    
    useEffect(() => {
        if (searchInitiated) {
            if (results.length > 0) {
                setSearchResults(results);
                setIsModalVisible(true); 
            } else if (searchKeyword) {
         
                handleInputNewPatient(searchName);
            }
            setSearchInitiated(false); 
        }
    }, [results]); 

    useEffect(() => {
        if (patientCodeKeyword) {
            setMedicalHistory(history);
        }
    }, [history, patientCodeKeyword, currentPatient.fullName]);
    
    const [editingKey, setEditingKey] = useState(null); 

    useEffect(() => {

        const patientCodeAtStart = currentPatient.patientCode && currentPatient.patientCode !== "Chưa có Mã" ? currentPatient.patientCode : (
        `BN${new Date().toLocaleString("vi-VN", {
            day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false,
        }).replace(/[/: ]/g, "").replace(",", "-")}`
    );
        if (!isNewPatientMode) {
            form.setFieldsValue({
                ...currentPatient,
                dateOfBirth: currentPatient.dateOfBirth ? moment(currentPatient.dateOfBirth, 'YYYY-MM-DD') : null,
                patientCode: currentPatient.patientCode === "Chưa có Mã" ? patientCodeAtStart : currentPatient.patientCode,
                bodyTemperature: 37.0, 
                bloodPressure: "120/80", 
                heartRate: 80, 
                symptoms: undefined,
                clinicalFindings: undefined,
                diagnosis: undefined,
                treatment: undefined,
                notes: undefined,
                weightKg: undefined,
                heightCm: undefined,
                respiratoryRate: undefined,
                // ⭐️ ĐẶT GIÁ TRỊ DỊ ỨNG THUỐC LÊN FORM (từ currentPatient - Giả định đã có trường này)
                drugAllergy: undefined, // Bạn có thể lấy từ currentPatient nếu có
            });
        } else {
            form.resetFields();
            form.setFieldsValue({
                fullName: searchName,
                patientCode: patientCodeAtStart,
                gender: 'Nam', 
                bodyTemperature: 37.0, 
                bloodPressure: "120/80",
                heartRate: 80,
                drugAllergy: undefined, // Hoặc để trống
            });
        }
    }, [currentPatient, isNewPatientMode, form, searchName]);
    
    // --- Logic Xử lý Bệnh nhân (Giữ nguyên) ---

    // ⭐️ CHỈNH SỬA: handleSearch chỉ kích hoạt tìm kiếm và bật cờ
    const handleSearch = () => {
        const trimmed = searchName?.trim();
        if (!trimmed) {
            messageApi.warning("Vui lòng nhập Họ Tên hoặc một phần của tên để tìm kiếm.");
            return;
        }

        const lowerCaseName = trimmed.toLowerCase();

        setSearchKeyword(lowerCaseName);
        setSearchInitiated(true); // Bật cờ để lắng nghe kết quả ở useEffect [results]
        
        // **XÓA LOGIC CŨ**: Logic kiểm tra results.length đã chuyển sang useEffect [results]
    };
    
    // ⭐️ CHỈNH SỬA: handleSelectPatient chỉ chọn bệnh nhân và kích hoạt load lịch sử
    const handleSelectPatient = (patient) => {
        const patientAgeAtVisit = calculateAge(patient.dateOfBirth);

        
        // Kích hoạt load lịch sử
        setPatientCodeKeyword(patient.patientCode) 
        
        // **XÓA LOGIC CŨ**: setMedicalHistory(history); 
        
        setCurrentPatient({
            ...patient,
            patientAgeAtVisit: patientAgeAtVisit,
           
            patientCode: patient.patientCode || "Chưa có Mã",
        });
        
        

        setSearchName(patient.fullName); 
        setIsModalVisible(false);
        setIsNewPatientMode(false); 
        setPrescriptionItems([]);
        setEditingKey(null); // Đảm bảo reset trạng thái chỉnh sửa
        
        // **XÓA LOGIC CŨ**: message.success được chuyển sang useEffect [history]
    };

    const handleInputNewPatient = (name = "") => {
        setCurrentPatient(initialPatientData); 
        setSearchName(name); 
        setPrescriptionItems([]);
        setIsModalVisible(false);
        setIsNewPatientMode(true); 
        setMedicalHistory([]);
        setEditingKey(null); // Đảm bảo reset trạng thái chỉnh sửa
        
        form.resetFields(); 
        form.setFieldsValue({ 
            fullName: name, 
            gender: 'Nam',
            bodyTemperature: 37.0, 
            bloodPressure: "120/80",
            heartRate: 80,
            drugAllergy: undefined, // Reset dị ứng thuốc
        }); 
        
        messageApi.info('Vui lòng nhập đầy đủ thông tin chi tiết cho bệnh nhân mới.');
    };
    
    // --- Logic Kê Đơn Thuốc (Giữ nguyên) ---

    // ⭐️ LOGIC THÊM THUỐC MỚI (LƯU ĐẦY ĐỦ THÔNG TIN LIỀU LƯỢNG)
    const onAddMedicine = (values) => {
        const { medicineId, quantity, morning, noon, afternoon, evening, note } = values;
        
        const totalDose = (morning || 0) + (noon || 0) + (afternoon || 0) + (evening || 0);
        
        // **KHẮC PHỤC LỖI THÊM THUỐC**: Kiểm tra số lượng
        if (quantity <= 0) {
             return messageApi.error('Tổng Số Lượng (SL) phải lớn hơn 0!');
        }
        if (totalDose > quantity) {
            return messageApi.error('Tổng liều lượng Sáng/Trưa/Chiều/Tối không được vượt quá Tổng Số Lượng!');
        }

        const selectedMedicine = mockMedicines.find(m => m.id === medicineId);
        
        if (selectedMedicine) {
            const newKey = Date.now();
            const usageInstruction = formatUsageInstruction({ morning, noon, afternoon, evening }, note);

            const newItem = {
                key: newKey,
                medicineId: medicineId,
                medicineName: selectedMedicine.name,
                quantity: quantity,
                usageInstruction: usageInstruction,
                // ⭐️ THÊM CÁC TRƯỜNG MỚI (Đơn vị, Giá bán, Thành tiền)
                unit: selectedMedicine.unit,
                priceSell: selectedMedicine.priceSell,
                totalPrice: quantity * selectedMedicine.priceSell, // TÍNH THÀNH TIỀN
                // ⭐️ LƯU CÁC TRƯỜNG LIỀU LƯỢNG (QUAN TRỌNG CHO VIỆC EDIT)
                morning: morning || 0,
                noon: noon || 0,
                afternoon: afternoon || 0,
                evening: evening || 0,
                note: note || "", 
            };
            
            setPrescriptionItems([...prescriptionItems, newItem]);
            medicineForm.resetFields();
            messageApi.success(`Đã thêm ${selectedMedicine.name} vào đơn.`);
        }
    };
    
    const onDeleteMedicine = (key) => {
        setPrescriptionItems(prescriptionItems.filter(item => item.key !== key));
        messageApi.info("Đã xóa thuốc khỏi đơn.");
    };

    // ⭐️ LOGIC BẮT ĐẦU CHỈNH SỬA
    const onEditMedicine = (record) => {
        setEditingKey(record.key);
        
        // Đổ dữ liệu của mục đang chỉnh sửa lên medicineForm
        medicineForm.setFieldsValue({
            medicineId: record.medicineId,
            quantity: record.quantity,
            // Sử dụng các giá trị đã lưu khi thêm/lưu trước đó
            morning: record.morning || 0,
            noon: record.noon || 0,
            afternoon: record.afternoon || 0,
            evening: record.evening || 0,
            note: record.note || "",
        });
        messageApi.info(`Đang chỉnh sửa thuốc: ${record.medicineName}`);
    };

    // ⭐️ LOGIC HỦY CHỈNH SỬA
    const onCancelEdit = () => {
        setEditingKey(null);
        medicineForm.resetFields();
        messageApi.info("Đã hủy chỉnh sửa.");
    };

    // ⭐️ LOGIC LƯU CHỈNH SỬA
    const onSaveEdit = (values) => {
        const { medicineId, quantity, morning, noon, afternoon, evening, note } = values;
        const totalDose = (morning || 0) + (noon || 0) + (afternoon || 0) + (evening || 0);
        
        if (quantity <= 0) {
             return messageApi.error('Tổng Số Lượng (SL) phải lớn hơn 0!');
        }
        if (totalDose > quantity) {
            return messageApi.error('Tổng liều lượng Sáng/Trưa/Chiều/Tối không được vượt quá Tổng Số Lượng!');
        }

        const selectedMedicine = mockMedicines.find(m => m.id === medicineId);
        const usageInstruction = formatUsageInstruction({ morning, noon, afternoon, evening }, note);

        const updatedItem = {
            key: editingKey, // Giữ nguyên key
            medicineId: medicineId, 
            medicineName: selectedMedicine.name,
            quantity: quantity,
            usageInstruction: usageInstruction,
            // ⭐️ CẬP NHẬT CÁC TRƯỜNG MỚI
            unit: selectedMedicine.unit,
            priceSell: selectedMedicine.priceSell,
            totalPrice: quantity * selectedMedicine.priceSell, // TÍNH THÀNH TIỀN
            // LƯU CÁC TRƯỜNG LIỀU LƯỢNG MỚI
            morning: morning || 0,
            noon: noon || 0,
            afternoon: afternoon || 0,
            evening: evening || 0,
            note: note || "",
        };

        // Cập nhật lại danh sách prescriptionItems
        setPrescriptionItems(prevItems => 
            prevItems.map(item => (item.key === editingKey ? updatedItem : item))
        );
        
        setEditingKey(null); // Thoát khỏi chế độ chỉnh sửa
        medicineForm.resetFields();
        messageApi.success(`Đã cập nhật thuốc: ${selectedMedicine.name}`);
    };

    // ⭐️ LOGIC LƯU HỒ SƠ VÀ TỔNG HỢP DỮ LIỆU (ĐÃ CẬP NHẬT DRUGALLERGY)
    const handleSave = async () => {
        if (!currentPatient.id && !isNewPatientMode) {
            messageApi.error("Vui lòng chọn hoặc nhập thông tin bệnh nhân trước khi lưu hồ sơ.");
            return;
        }

        if (prescriptionItems.length === 0) {
            messageApi.error("Vui lòng kê đơn thuốc trước khi lưu.");
            return;
        }

        try {
            // Lấy dữ liệu từ 2 form (thông tin BN và khám bệnh)
            const patientData = await form.validateFields();
            
            // Xử lý dữ liệu cơ bản
            const dateOfBirth = isNewPatientMode && patientData.dateOfBirth ? patientData.dateOfBirth.format('YYYY-MM-DD') : currentPatient.dateOfBirth;
            const nextAppointmentDate = patientData.nextAppointmentDate ? patientData.nextAppointmentDate.format('YYYY-MM-DD') : null;
            
            // Tính BMI
            const bmi = (patientData.weightKg && patientData.heightCm) 
                ? (patientData.weightKg / Math.pow(patientData.heightCm / 100, 2)).toFixed(1)
                : null;
                
            // ⭐️ LẤY DỊ ỨNG THUỐC TỪ FORM (ĐÃ SỬA ĐỔI)
            // Lấy trực tiếp từ patientData.drugAllergy
            const drugAllergyFromForm = patientData.drugAllergy || "";

            // 1. Chuẩn bị Patient Payload
            const patientPayload = {
               patientCode: patientData.patientCode === "Chưa có Mã" ? null : patientData.patientCode,
                fullName: isNewPatientMode ? patientData.fullName : currentPatient.fullName,
                dateOfBirth: dateOfBirth,
                gender: isNewPatientMode ? patientData.gender : currentPatient.gender,
                address: isNewPatientMode ? patientData.address : currentPatient.address,
                representativeName: isNewPatientMode ? patientData.representativeName : currentPatient.representativeName,
                representativePhone: isNewPatientMode ? patientData.representativePhone : currentPatient.representativePhone,
            };

            // 2. Chuẩn bị MedicalRecord Payload (ĐẦY ĐỦ TRƯỜNG NHƯ YÊU CẦU)
            const medicalRecordPayload = {
                symptoms: patientData.symptoms || "",
                diagnosis: patientData.diagnosis || "",
                treatment: patientData.treatment || "", 
                notes: patientData.notes || "", 
                nextAppointmentDate: nextAppointmentDate,
                weightKg: patientData.weightKg || null,
                heightCm: patientData.heightCm || null,
                patientAgeAtVisit: currentPatient.patientAgeAtVisit,
                clinicalFindings: patientData.clinicalFindings || "",
                bodyTemperature: patientData.bodyTemperature || null,
                heartRate: patientData.heartRate || null,
                respiratoryRate: patientData.respiratoryRate || null, 
                bmi: bmi,
                bloodPressure: patientData.bloodPressure || "",
                // ⭐️ LƯU DRUG ALLERGY VÀO MEDICAL RECORD
                drugAllergy: drugAllergyFromForm,
            };

            // 3. Chuẩn bị Prescription Items Payload
            const prescriptionItemsPayload = prescriptionItems.map(item => {
                // Giả định Dosage là nồng độ (vd: 500mg) nếu có trong tên thuốc
                const dosageText = item.medicineName?.match(/\d+mg/)?.[0] || "N/A";
                return {
                    medicineId: item.medicineId,
                    quantity: item.quantity,
                    dosage: dosageText, 
                    usageInstruction: item.usageInstruction,
                }
            });
            
            // 4. Tổng hợp Payload
            const payload = {
                patient: patientPayload,
                medicalRecord: medicalRecordPayload,
                prescription: { items: prescriptionItemsPayload },
                createdBy: currentUser.id 
            };

            dispatch(fetchPostExamination(payload))
                    .then((res) => {
                        if (res.meta.requestStatus === "rejected") {
                        messageApi.error("Không thể lưu thông tin khám bệnh! (Lỗi server)");
                        console.error("Error:", res.error);
                        return;
                        }

                        const data = res.payload;
                        if (!data || data.success === false) { 
                        messageApi.error("Không thể lưu thông tin khám bệnh! " + (data?.message || ""));
                        return;
                        }
                        messageApi.success("Khám bệnh đã được lưu thành công!");
                        setSuccessPayload({...payload, totalAmount: totalAmount, prescriptionItems: prescriptionItems});
                    })
                    .catch((err) => {
                        console.error("Unexpected error:", err);
                        messageApi.error("Có lỗi xảy ra khi lưu hồ sơ!");
                    });


        } catch (errorInfo) {
            message.error("Vui lòng nhập đầy đủ các trường bắt buộc (Họ tên, ngày sinh, Triệu chứng, Chẩn đoán).");
        }
    };
    
    // Tính tổng tiền thuốc (Đã được sửa lại để lấy từ totalPrice đã tính)
    const totalAmount = prescriptionItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

    // --- JSX Render ---
    if (successPayload) {
        // Truyền payload đã lưu, tổng tiền và hook navigate
        return <ExaminationSuccessScreen 
            payload={successPayload} 
            totalAmount={totalAmount} 
            navigate={navigate} 
        />;
    }
    return (
        <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            {contextHolder}
            <Header style={{ background: '#001529', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={3} style={{ color: 'white', margin: 0 }}>
                    PHIẾU KHÁM BỆNH 
                </Title>
                <Space>
                 
                    <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>Lưu Hồ Sơ & Kê Đơn</Button>
                </Space>
            </Header>
            
            <Content style={{ padding: '10px 24px' }}>
                <div style={{ padding: '10px', background: '#fff' }}>
                    
                    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                        
                        {/* CỘT TRÁI: THÔNG TIN BỆNH NHÂN & CHỈ SỐ SINH TỒN (Col 11) */}
                        <Col span={11}>
                            <Card 
                                title={<><UserOutlined /> Thông Tin & Chỉ Số Cơ Bản</>} 
                                size="small"
                                bordered={false}
                            >
                                {/* Thanh tìm kiếm (Giữ nguyên) */}
                                <Form layout="vertical" form={form}>
                                    <Row gutter={16}>
                                        <Col span={12}>
                                          <Form.Item 
                                                label="Mã BN" 
                                                name="patientCode" 
                                                // Giá trị ban đầu sẽ được đổ từ form.setFieldsValue trong useEffect
                                            >
                                                <Input disabled /> 
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item label="Họ Tên Bệnh Nhân">
                                                <Input.Search
                                                    placeholder="Nhập họ tên bệnh nhân..."
                                                    enterButton="Tìm"
                                                    value={searchName}
                                                    onSearch={handleSearch}
                                                    onChange={(e) => setSearchName(e.target.value)}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Form>
                                
                                <Divider style={{ margin: '10px 0' }} />

                                {/* FORM NHẬP THÔNG TIN CHI TIẾT (BN MỚI) */}
                                {isNewPatientMode ? (
                                    <Card size="small" type="inner" title="Nhập Thông Tin Bệnh Nhân Mới" style={{ marginBottom: 10 }}>
                                        <Form 
                                            form={form} 
                                            layout="vertical"
                                            // ⭐️ XÓA logic onValuesChange cho drugAllergy
                                            onValuesChange={(changedValues, allValues) => {
                                                if (changedValues.dateOfBirth) {
                                                    const dob = changedValues.dateOfBirth?.format('YYYY-MM-DD');
                                                    const age = calculateAge(dob);
                                                    setCurrentPatient(prev => ({ 
                                                        ...prev, 
                                                        dateOfBirth: dob, 
                                                        patientAgeAtVisit: age,
                                                        fullName: allValues.fullName 
                                                    }));
                                                }
                                                if (changedValues.fullName) {
                                                     setCurrentPatient(prev => ({ ...prev, fullName: changedValues.fullName }));
                                                }
                                            }}
                                        >
                                            <Row gutter={16}>
                                                <Col span={24}>
                                                    <Form.Item name="fullName" label="Họ Tên Đầy Đủ" rules={[{ required: true, message: 'Nhập họ tên!' }]}>
                                                        <Input placeholder="Nguyễn Văn A" />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                            <Row gutter={16}>
                                                <Col span={12}>
                                                    <Form.Item name="gender" label="Giới tính" initialValue="Nam" rules={[{ required: true, message: 'Chọn GT!' }]}>
                                                        <Select>
                                                            <Option value="male">Nam</Option>
                                                            <Option value="female">Nữ</Option>
                                                        </Select>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={12}>
                                                    <Form.Item name="dateOfBirth" label="Ngày sinh" rules={[{ required: true, message: 'Chọn NS!' }]}>
                                                        <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                            <Form.Item name="address" label="Địa chỉ">
                                                <Input placeholder="Số nhà, đường, quận/huyện..." />
                                            </Form.Item>
                                          
                                            <Divider orientation="left" style={{ margin: '10px 0' }}>Người Đại Diện (Nếu cần)</Divider>
                                            <Row gutter={16}>
                                                <Col span={12}>
                                                    <Form.Item name="representativeName" label="Tên Người Đại Diện">
                                                        <Input placeholder="Trần Thị B" />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={12}>
                                                    <Form.Item name="representativePhone" label="SĐT Đại Diện">
                                                        <Input placeholder="09xxxxxxx" />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Form>
                                    </Card>
                                ) : (
                                    // HIỂN THỊ DỮ LIỆU CHI TIẾT CỦA BỆNH NHÂN CŨ
                                    <>
                                        <Descriptions bordered size="small" column={3}>
                                            <Descriptions.Item label='Họ Tên' span={3}>
                                                <Title level={5} style={{ margin: 0 }}>{currentPatient.fullName}</Title>
                                            </Descriptions.Item>
                                            <Descriptions.Item label='Tuổi/GT' span={1}>
                                                {currentPatient.patientAgeAtVisit} / {
                                                    // ⭐️ SỬ DỤNG TOÁN TỬ BA NGÔI CHO GIỚI TÍNH
                                                    currentPatient.gender 
                                                        ? (currentPatient.gender.toLowerCase() === 'male' ? 'Nam' : 'Nữ') 
                                                        : 'N/A'
                                                }
                                            </Descriptions.Item>
                                            <Descriptions.Item label='Ngày Sinh' span={2}>
                                                {currentPatient.dateOfBirth || 'N/A'}
                                            </Descriptions.Item>
                                            <Descriptions.Item label='SĐT' span={1}>
                                                {currentPatient.phone || 'Không'}
                                            </Descriptions.Item>
                                            <Descriptions.Item label='Địa chỉ' span={2}>
                                                {currentPatient.address || 'N/A'}
                                            </Descriptions.Item>
                                            <Descriptions.Item label='Người Đại diện' span={2}>
                                                {currentPatient.representativeName || 'N/A'}
                                            </Descriptions.Item>
                                            <Descriptions.Item label='SĐT Đại diện' span={1}>
                                                {currentPatient.representativePhone || 'N/A'}
                                            </Descriptions.Item>
                                        </Descriptions>
                                        
                                        {/* ⭐️ XÓA: PHẦN HIỂN THỊ DỊ ỨNG ở đây */}
                                    </>
                                )}

                                {/* PHẦN CHỈ SỐ SINH TỒN (Giữ nguyên) */}
                                <Divider orientation="left" style={{ marginTop: 15, marginBottom: 10 }}>Chỉ Số Sinh Tồn</Divider>
                                <Form layout="vertical" form={form}>
                                    <Row gutter={16}>
                                        <Col span={8}><Form.Item name="bodyTemperature" label="Nhiệt Độ (°C)" initialValue={37.0}><InputNumber min={35} max={42} step={0.1} style={{ width: '100%' }} /></Form.Item></Col>
                                        <Col span={8}><Form.Item name="bloodPressure" label="Huyết Áp" initialValue={"120/80"}><Input /></Form.Item></Col>
                                        <Col span={8}><Form.Item name="heartRate" label="Nhịp Tim (bpm)" initialValue={80}><InputNumber min={40} max={180} style={{ width: '100%' }} /></Form.Item></Col>
                                    </Row>
                                </Form>
                            </Card>
                        </Col>

                        {/* CỘT PHẢI: KHÁM LÂM SÀNG & CHẨN ĐOÁN (CẬP NHẬT) */}
                        <Col span={13}>
                            <Card title={<><HeartOutlined /> Khám Lâm Sàng & Chẩn Đoán</>} size="small" bordered={false} style={{ height: '100%' }}>
                                <Form layout="vertical" form={form}>
                                    <Form.Item name="symptoms" label="Triệu Chứng/Tình trạng hiện tại" rules={[{ required: true, message: 'Nhập triệu chứng!' }]}><TextArea rows={2} placeholder="Ho, sốt, đau họng..." /></Form.Item>
                                    <Form.Item name="clinicalFindings" label="Khám Lâm Sàng"><TextArea rows={2} placeholder="Họng đỏ, phổi thông khí tốt..." /></Form.Item>
                                    
                                    <Form.Item name="diagnosis" label="Chẩn Đoán" rules={[{ required: true, message: 'Nhập chẩn đoán!' }]}><Input placeholder="Viêm họng cấp do virus" /></Form.Item>
                                    <Form.Item name="treatment" label="Hướng Dẫn Điều Trị"><TextArea rows={1} placeholder="Điều trị kháng viêm, hạ sốt, nghỉ ngơi..." /></Form.Item> 
                                    <Form.Item name="notes" label="Ghi Chú Chung"><TextArea rows={1} placeholder="Lưu ý: Hẹn tái khám sau 3 ngày." /></Form.Item>
                                    
                                    <Divider orientation="left" style={{ margin: '10px 0' }}>Thông số bổ sung</Divider>
                                 

                                    <Row gutter={16}>
                                        <Col span={8}><Form.Item name="weightKg" label="Cân Nặng (kg)"><InputNumber min={1} step={0.1} style={{ width: '100%' }} /></Form.Item></Col> 
                                        <Col span={8}><Form.Item name="heightCm" label="Chiều Cao (cm)"><InputNumber min={50} step={0.1} style={{ width: '100%' }} /></Form.Item></Col> 
                                        <Col span={8}><Form.Item name="respiratoryRate" label="Nhịp Thở (l/phút)"><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col> 
                                    </Row>
                                    <Row gutter={16}>
                                        <Col span={12}><Form.Item name="nextAppointmentDate" label="Ngày Tái Khám"><DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" /></Form.Item></Col>
                                        {/* ⭐️ THÊM: Form.Item name="drugAllergy" cho cả BN mới và cũ */}
                                        <Col span={12}>
                                            <Form.Item name="drugAllergy" label="Dị Ứng Thuốc">
                                                <Input placeholder="Ví dụ: Penicillin" />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Form>
                            </Card>
                        </Col>
                    </Row>
                    
                    {/* HÀNG 2: KÊ ĐƠN THUỐC (Giữ nguyên) */}
                    <Card title={<><MedicineBoxOutlined /> Kê Đơn Thuốc Hiện Tại</>} size="small" bordered={false}>
                        {/* Form thêm/chỉnh sửa thuốc */}
                        <Form 
                            form={medicineForm} 
                            onFinish={editingKey !== null ? onSaveEdit : onAddMedicine} 
                            layout="inline" 
                            style={{ marginBottom: 10, padding: '10px', border: '1px dashed #ccc', borderRadius: 4 }}
                        >
                            <Form.Item name="medicineId" label="Thuốc" rules={[{ required: true, message: 'Chọn thuốc!' }]}>
                                <Select 
                                    placeholder="Chọn thuốc" 
                                    style={{ width: 200 }} 
                                    showSearch 
                                    filterOption={(input, option) => String(option.children).toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                    // Vô hiệu hóa khi chỉnh sửa (Không cho phép đổi thuốc)
                                    disabled={editingKey !== null} 
                                >
                                    {mockMedicines.map(m => <Option key={m.id} value={m.id}>{m.name} - {m.unit}</Option>)}
                                </Select>
                            </Form.Item>
                            <Form.Item name="quantity" label="Tổng SL" rules={[{ required: true, message: 'Nhập SL!' }]}>
                                <InputNumber min={1} style={{ width: 70 }} />
                            </Form.Item>
                            <Form.Item name="morning" label="Sáng"><InputNumber min={0} style={{ width: 60 }} /></Form.Item>
                            <Form.Item name="noon" label="Trưa"><InputNumber min={0} style={{ width: 60 }} /></Form.Item>
                            <Form.Item name="afternoon" label="Chiều"><InputNumber min={0} style={{ width: 60 }} /></Form.Item>
                            <Form.Item name="evening" label="Tối"><InputNumber min={0} style={{ width: 60 }} /></Form.Item>
                            <Form.Item name="note" label="Ghi chú"><Input placeholder="..." style={{ width: 150 }} /></Form.Item>
                            
                            <Form.Item>
                                {/* Hiển thị nút Lưu/Hủy hoặc Thêm */}
                                {editingKey !== null ? (
                                    <Space>
                                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>Lưu</Button>
                                        <Button type="default" onClick={onCancelEdit}>Hủy</Button>
                                    </Space>
                                ) : (
                                    <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>Thêm</Button>
                                )}
                            </Form.Item>
                        </Form>

                        {/* Bảng toa thuốc hiện tại */}
                        <Table
                            columns={prescriptionColumns(onDeleteMedicine, onEditMedicine, editingKey)}
                            dataSource={prescriptionItems}
                            pagination={false}
                            size="small"
                            bordered
                            locale={{ emptyText: "Chưa có thuốc nào trong đơn hiện tại." }}
                            // Highlight hàng đang được chỉnh sửa
                            rowClassName={(record) => record.key === editingKey ? 'ant-table-row-selected' : ''}
                        />
                        
                        {/* HIỂN THỊ TỔNG TIỀN THUỐC (Giữ nguyên) */}
                        <div style={{ textAlign: 'right', marginTop: 10, paddingRight: 20, fontSize: '1.2em', fontWeight: 'bold', color: '#08979c' }}>
                            TỔNG TIỀN THUỐC: {totalAmount.toLocaleString('vi-VN')}đ
                        </div>
                        
                        {/* HIỂN THỊ LỊCH SỬ TOA THUỐC CŨ */}
                        {medicalHistory.length > 0 && <OldPrescriptionHistory history={medicalHistory} />}
                        
                    </Card>
                </div>
            </Content>

            {/* Modal Tìm kiếm Bệnh nhân (Giữ nguyên) */}
            <PatientSearchModal
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                searchResults={searchResults}
                onSelectPatient={handleSelectPatient}
                onInputNewPatient={handleInputNewPatient}
                searchName={searchName}
            />
        </Layout>
    );
};

export default PatientExaminationForm;