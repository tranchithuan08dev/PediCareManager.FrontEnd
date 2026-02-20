import React, { useState, useEffect, useRef } from 'react';
import { 
    Card, Descriptions, Typography, Layout, Row, Col, 
    Button, Form, Input, InputNumber, Select, Space, Table, Alert, 
    Divider, DatePicker, message, Modal,
    Collapse 
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { 
    UserOutlined, HeartOutlined, HistoryOutlined, PlusOutlined, DeleteOutlined, SaveOutlined, MedicineBoxOutlined, SearchOutlined,
    EditOutlined
} from '@ant-design/icons';
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


// =====================================================
// ⭐️ CUSTOM MEDICINE SELECT với keyboard navigation
// =====================================================
const MedicineSearchSelect = ({ medicines, value, onChange, disabled, inputRef }) => {
    const [inputValue, setInputValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const dropdownRef = useRef(null);
    const itemRefs = useRef([]);

    const filtered = inputValue
        ? medicines.filter(m =>
            m.name.toLowerCase().includes(inputValue.toLowerCase()) ||
            (m.unit && m.unit.toLowerCase().includes(inputValue.toLowerCase()))
          )
        : medicines;

    // Reset khi value bị clear từ bên ngoài (sau khi thêm thuốc)
    useEffect(() => {
        if (value === null || value === undefined) {
            setInputValue('');
            setHighlightedIndex(-1);
        }
    }, [value]);

    // Scroll item được highlight vào tầm nhìn
    useEffect(() => {
        if (highlightedIndex >= 0 && itemRefs.current[highlightedIndex]) {
            itemRefs.current[highlightedIndex].scrollIntoView({ block: 'nearest' });
        }
    }, [highlightedIndex]);

    const handleSelect = (medicine) => {
        setInputValue(`${medicine.name} (${medicine.unit})`);
        setIsOpen(false);
        setHighlightedIndex(-1);
        onChange(medicine.id);
    };

    const handleKeyDown = (e) => {
        if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            setIsOpen(true);
            setHighlightedIndex(0);
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev => (prev + 1) % filtered.length);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => (prev <= 0 ? filtered.length - 1 : prev - 1));
                break;
            case 'Enter':
                if (isOpen && highlightedIndex >= 0 && filtered[highlightedIndex]) {
                    e.preventDefault();
                    e.stopPropagation(); // Ngăn form submit khi đang chọn thuốc
                    handleSelect(filtered[highlightedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setHighlightedIndex(-1);
                break;
            default:
                break;
        }
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        setInputValue(val);
        setIsOpen(true);
        setHighlightedIndex(val ? 0 : -1);
        if (!val) onChange(null);
    };

    return (
        <div style={{ position: 'relative', width: 230 }}>
            <Input
                ref={inputRef}
                value={inputValue}
                disabled={disabled}
                placeholder="Tìm thuốc... (↑↓ Enter)"
                onChange={handleInputChange}
                onFocus={() => {
                    setIsOpen(true);
                    if (filtered.length > 0) setHighlightedIndex(0);
                }}
                onBlur={() => setTimeout(() => setIsOpen(false), 180)}
                onKeyDown={handleKeyDown}
                style={{ width: '100%' }}
                autoComplete="off"
            />

            {isOpen && filtered.length > 0 && (
                <div
                    ref={dropdownRef}
                    style={{
                        position: 'absolute',
                        zIndex: 9999,
                        background: '#fff',
                        border: '1px solid #d9d9d9',
                        borderRadius: 6,
                        maxHeight: 260,
                        overflowY: 'auto',
                        width: 320,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                        top: '100%',
                        left: 0,
                        marginTop: 2,
                    }}
                >
                    {filtered.map((m, idx) => (
                        <div
                            key={m.id}
                            ref={el => itemRefs.current[idx] = el}
                            onMouseDown={() => handleSelect(m)}
                            onMouseEnter={() => setHighlightedIndex(idx)}
                            style={{
                                padding: '7px 12px',
                                cursor: 'pointer',
                                background: idx === highlightedIndex ? '#e6f7ff' : '#fff',
                                borderBottom: '1px solid #f5f5f5',
                                fontSize: 13,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'background 0.1s',
                            }}
                        >
                            <strong style={{ color: idx === highlightedIndex ? '#1677ff' : '#222' }}>
                                {m.name}
                            </strong>
                            <span style={{ color: '#888', marginLeft: 6, fontSize: 12 }}>— {m.unit}</span>
                        </div>
                    ))}
                </div>
            )}

            {isOpen && filtered.length === 0 && inputValue && (
                <div style={{
                    position: 'absolute', zIndex: 9999, background: '#fff',
                    border: '1px solid #d9d9d9', borderRadius: 6, width: 260,
                    padding: '10px 14px', color: '#999', fontSize: 13,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)', top: '100%', left: 0, marginTop: 2,
                }}>
                    Không tìm thấy thuốc phù hợp
                </div>
            )}
        </div>
    );
};


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

// --- Cấu hình cột cho bảng đơn thuốc ---
const prescriptionColumns = (onDeleteMedicine, onEditMedicine, editingKey) => [
    { title: 'Thuốc', dataIndex: 'medicineName', key: 'medicineName' },
    { title: 'Đơn vị', dataIndex: 'unit', key: 'unit', width: 80 }, 
    { title: 'SL', dataIndex: 'quantity', key: 'quantity', width: 60 },
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
                    disabled={editingKey !== null && editingKey !== record.key} 
                >
                    {editingKey === record.key ? "..." : ""}
                </Button>
                <Button 
                    danger 
                    icon={<DeleteOutlined />} 
                    size="small"
                    onClick={() => onDeleteMedicine(record.key)}
                    disabled={editingKey !== null}
                />
            </Space>
        ),
    },
];

// --- Hàm hỗ trợ ---
const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const birthDate = moment(dob, 'YYYY-MM-DD');
    const now = moment();
    const years = now.diff(birthDate, 'years');
    if (years >= 1) return `${years} tuổi`;
    const months = now.diff(birthDate, 'months');
    if (months >= 1) return `${months} tháng`;
    const days = now.diff(birthDate, 'days');
    return `${days} ngày`;
};

// ✅ ĐÃ SỬA: Nhận thêm tham số `unit` để hiển thị đúng đơn vị (viên, gói, ...)
const formatUsageInstruction = (dosage, note, unit = 'viên') => {
    const u = unit?.trim() || 'viên';
    const parts = [];
    if (dosage.morning > 0) parts.push(`Sáng: ${dosage.morning} ${u}`);
    if (dosage.noon > 0) parts.push(`Trưa: ${dosage.noon} ${u}`);
    if (dosage.afternoon > 0) parts.push(`Chiều: ${dosage.afternoon} ${u}`);
    if (dosage.evening > 0) parts.push(`Tối: ${dosage.evening} ${u}`);
    const totalDose = (dosage.morning || 0) + (dosage.noon || 0) + (dosage.afternoon || 0) + (dosage.evening || 0);
    let instruction = parts.length > 0
        ? `Uống ${totalDose} ${u}/ngày. Phân liều: ${parts.join(', ')}.`
        : "Uống theo chỉ định.";
    if (note) instruction += ` Hướng dẫn: ${note}`;
    return instruction.trim();
};

const calculateTotalQuantity = (morning, noon, afternoon, evening, days) => {
    const dailyDose = (morning || 0) + (noon || 0) + (afternoon || 0) + (evening || 0);
    const totalQuantity = dailyDose * (days || 1);
    return Math.ceil(totalQuantity);
};

// --- Modal Tìm kiếm Bệnh nhân ---
const PatientSearchModal = ({ isVisible, onClose, searchResults, onSelectPatient, onInputNewPatient, searchName }) => {
    const columns = [
        { title: 'Mã BN', dataIndex: 'patientCode', key: 'patientCode', render: text => text || "Chưa có Mã" },
        { title: 'Họ Tên', dataIndex: 'fullName', key: 'fullName' },
        { 
            title: 'Ngày Sinh', 
            dataIndex: 'dateOfBirth', 
            key: 'dateOfBirth', 
            render: text => text ? moment(text).format('DD/MM/YYYY') : "N/A" 
        },
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

// --- COMPONENT LỊCH SỬ TOA THUỐC CŨ ---
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
    const [searchInitiated, setSearchInitiated] = useState(false); 
    const [successPayload, setSuccessPayload] = useState(null); 
    const navigate = useNavigate();
    
    // ⭐️ State: Số ngày uống thuốc
    const [medicationDays, setMedicationDays] = useState(1);

    // ⭐️ REF: Để focus lại ô chọn thuốc sau khi thêm
    const medicineInputRef = useRef(null);

    // ⭐️ State: medicineId hiện tại trong form (để MedicineSearchSelect biết khi reset)
    const [selectedMedicineId, setSelectedMedicineId] = useState(null);
    
    const DataMedicines = useSelector((state)=> state?.MEDICINE?.listMedicineProcessExamination) || []; 
    const mockMedicines = DataMedicines.filter(m => (m.stockQuantity ?? m.quantityInStock ?? 0) > 15);
    const results = useSelector((state)=> state?.PATIENT?.listSearch) || []; 
    const history = useSelector((state)=> state?.PATIENT?.patientHistory) || []; 
    const currentUser = useSelector((state)=> state?.AUTH?.currentuser) || []; 
    
    const dispatch = useDispatch();
    
    useEffect(()=>{
        dispatch(fetchGetAllMedicineProcessExamination())
        if (searchKeyword != null) {
             dispatch(fetchGetListPatientSearch(searchKeyword))
        }
        if (patientCodeKeyword != null) {
              dispatch(fetchGetPatientHistory(patientCodeKeyword))
        }
    },[searchKeyword, dispatch, patientCodeKeyword])

    // Cảnh báo thuốc
    useEffect(() => {
        if (!history.length) return;
        const recordsWithAllergy = history.filter(h => h.drugAllergy);
        if (recordsWithAllergy.length === 0) return;
        const latestRecord = recordsWithAllergy.reduce((latest, current) =>
            new Date(current.visitDate) > new Date(latest.visitDate) ? current : latest
        );
        form.setFieldsValue({ medicalHistory: latestRecord?.drugAllergy || "" });
    }, [history, form]); 

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
                medicalHistory: undefined,
            });
        } else {
            form.resetFields();
            form.setFieldsValue({
                fullName: searchName,
                patientCode: patientCodeAtStart,
                gender: 'male', 
                bodyTemperature: 37.0, 
                bloodPressure: "120/80",
                heartRate: 80,
                medicalHistory: undefined,
            });
        }
    }, [currentPatient, isNewPatientMode, form, searchName]);
    
    // --- Logic Xử lý Bệnh nhân ---
    const handleSearch = () => {
        const trimmed = searchName?.trim();
        if (!trimmed) {
            messageApi.warning("Vui lòng nhập Họ Tên hoặc một phần của tên để tìm kiếm.");
            return;
        }
        setSearchKeyword(trimmed.toLowerCase());
        setSearchInitiated(true);
    };
    
    const handleSelectPatient = (patient) => {
        const patientAgeAtVisit = calculateAge(patient.dateOfBirth);
        setPatientCodeKeyword(patient.patientCode);
        setCurrentPatient({
            ...patient,
            patientAgeAtVisit: patientAgeAtVisit,
            patientCode: patient.patientCode || "Chưa có Mã",
        });
        setSearchName(patient.fullName); 
        setIsModalVisible(false);
        setIsNewPatientMode(false); 
        setPrescriptionItems([]);
        setEditingKey(null);
    };

    const handleInputNewPatient = (name = "") => {
        setCurrentPatient(initialPatientData); 
        setSearchName(name); 
        setPrescriptionItems([]);
        setIsModalVisible(false);
        setIsNewPatientMode(true); 
        setMedicalHistory([]);
        setEditingKey(null);
        form.resetFields(); 
        form.setFieldsValue({ 
            fullName: name, 
            gender: 'male',
            bodyTemperature: 37.0, 
            bloodPressure: "120/80",
            heartRate: 80,
            medicalHistory: undefined,
        }); 
        messageApi.info('Vui lòng nhập đầy đủ thông tin chi tiết cho bệnh nhân mới.');
    };
    
    // --- Logic Kê Đơn Thuốc ---
    const handleDosageChange = () => {
        const values = medicineForm.getFieldsValue();
        const { morning, noon, afternoon, evening } = values;
        const totalQty = calculateTotalQuantity(morning, noon, afternoon, evening, medicationDays);
        medicineForm.setFieldsValue({ quantity: totalQty });
    };

    const handleMedicationDaysChange = (days) => {
        setMedicationDays(days || 1);
        const values = medicineForm.getFieldsValue();
        const { morning, noon, afternoon, evening } = values;
        const totalQty = calculateTotalQuantity(morning, noon, afternoon, evening, days || 1);
        medicineForm.setFieldsValue({ quantity: totalQty });
        if (days) {
            const nextDate = moment().add(days, 'days');
            form.setFieldsValue({ nextAppointmentDate: nextDate });
        }
    };

    // ✅ ĐÃ SỬA: Truyền selectedMedicine.unit vào formatUsageInstruction
    const onAddMedicine = (values) => {
        const { medicineId, quantity, morning, noon, afternoon, evening, note } = values;
        
        if (!medicineId) {
            return messageApi.error('Vui lòng chọn thuốc!');
        }

        if (!quantity || quantity <= 0) {
            return messageApi.error('Tổng Số Lượng (SL) phải lớn hơn 0!');
        }

        const selectedMedicine = mockMedicines.find(m => m.id === medicineId);
        
        if (selectedMedicine) {
            const newKey = Date.now();
            // ✅ Truyền unit của thuốc để hiển thị đúng (viên, gói, ...)
            const usageInstruction = formatUsageInstruction(
                { morning, noon, afternoon, evening },
                note,
                selectedMedicine.unit
            );

            const newItem = {
                key: newKey,
                medicineId: medicineId,
                medicineName: selectedMedicine.name,
                quantity: quantity,
                usageInstruction: usageInstruction,
                unit: selectedMedicine.unit,
                priceSell: selectedMedicine.priceSell,
                totalPrice: quantity * selectedMedicine.priceSell,
                morning: morning || 0,
                noon: noon || 0,
                afternoon: afternoon || 0,
                evening: evening || 0,
                note: note || "", 
            };
            
            setPrescriptionItems(prev => [...prev, newItem]);

            // Reset form thuốc và clear selectedMedicineId để MedicineSearchSelect tự reset
            medicineForm.resetFields();
            setSelectedMedicineId(null);

            messageApi.success(`Đã thêm ${selectedMedicine.name} vào đơn.`);

            // Focus lại ô tìm kiếm thuốc sau khi thêm
            setTimeout(() => {
                medicineInputRef.current?.focus();
            }, 50);
        }
    };
    
    const onDeleteMedicine = (key) => {
        setPrescriptionItems(prescriptionItems.filter(item => item.key !== key));
        messageApi.info("Đã xóa thuốc khỏi đơn.");
    };

    const onEditMedicine = (record) => {
        setEditingKey(record.key);
        setSelectedMedicineId(record.medicineId);
        medicineForm.setFieldsValue({
            medicineId: record.medicineId,
            quantity: record.quantity,
            morning: record.morning || 0,
            noon: record.noon || 0,
            afternoon: record.afternoon || 0,
            evening: record.evening || 0,
            note: record.note || "",
        });
        messageApi.info(`Đang chỉnh sửa thuốc: ${record.medicineName}`);
    };

    const onCancelEdit = () => {
        setEditingKey(null);
        setSelectedMedicineId(null);
        medicineForm.resetFields();
        messageApi.info("Đã hủy chỉnh sửa.");
        // Focus lại ô tìm thuốc sau khi hủy edit
        setTimeout(() => {
            medicineInputRef.current?.focus();
        }, 50);
    };

    // ✅ ĐÃ SỬA: Truyền selectedMedicine.unit vào formatUsageInstruction
    const onSaveEdit = (values) => {
        const { medicineId, quantity, morning, noon, afternoon, evening, note } = values;
        
        if (!quantity || quantity <= 0) {
            return messageApi.error('Tổng Số Lượng (SL) phải lớn hơn 0!');
        }

        const selectedMedicine = mockMedicines.find(m => m.id === medicineId);
        // ✅ Truyền unit của thuốc để hiển thị đúng (viên, gói, ...)
        const usageInstruction = formatUsageInstruction(
            { morning, noon, afternoon, evening },
            note,
            selectedMedicine.unit
        );

        const updatedItem = {
            key: editingKey,
            medicineId: medicineId, 
            medicineName: selectedMedicine.name,
            quantity: quantity,
            usageInstruction: usageInstruction,
            unit: selectedMedicine.unit,
            priceSell: selectedMedicine.priceSell,
            totalPrice: quantity * selectedMedicine.priceSell,
            morning: morning || 0,
            noon: noon || 0,
            afternoon: afternoon || 0,
            evening: evening || 0,
            note: note || "",
        };

        setPrescriptionItems(prevItems => 
            prevItems.map(item => (item.key === editingKey ? updatedItem : item))
        );
        
        setEditingKey(null);
        setSelectedMedicineId(null);
        medicineForm.resetFields();
        messageApi.success(`Đã cập nhật thuốc: ${selectedMedicine.name}`);

        // Focus lại ô tìm thuốc sau khi lưu edit
        setTimeout(() => {
            medicineInputRef.current?.focus();
        }, 50);
    };

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
            const patientData = await form.validateFields();
            const dateOfBirth = isNewPatientMode && patientData.dateOfBirth
                ? patientData.dateOfBirth.format('YYYY-MM-DD')
                : currentPatient.dateOfBirth || null;

            const nextAppointmentDate = patientData.nextAppointmentDate
                ? patientData.nextAppointmentDate.format('YYYY-MM-DD')
                : null;
            
            const bmi = (patientData.weightKg && patientData.heightCm) 
                ? (patientData.weightKg / Math.pow(patientData.heightCm / 100, 2)).toFixed(1)
                : null;
                
            const medicalHistoryFromForm = patientData.medicalHistory || "";

            const patientPayload = {
                patientCode: patientData.patientCode === "Chưa có Mã" ? null : patientData.patientCode,
                fullName: isNewPatientMode ? patientData.fullName : currentPatient.fullName,
                dateOfBirth: dateOfBirth,
                gender: isNewPatientMode ? patientData.gender : currentPatient.gender,
                address: isNewPatientMode ? patientData.address : currentPatient.address,
                representativeName: isNewPatientMode ? patientData.representativeName : currentPatient.representativeName,
                representativePhone: isNewPatientMode ? patientData.representativePhone : currentPatient.representativePhone,
            };

            const medicalRecordPayload = {
                symptoms: patientData.symptoms || "",
                diagnosis: patientData.diagnosis || "",
                treatment: patientData.treatment || "", 
                notes: patientData.notes || "", 
                nextAppointmentDate: nextAppointmentDate,
                weightKg: patientData.weightKg || null,
                heightCm: patientData.heightCm || null,
                patientAgeAtVisit: parseInt(currentPatient.patientAgeAtVisit, 10) || null,
                clinicalFindings: patientData.clinicalFindings || "",
                bodyTemperature: patientData.bodyTemperature || null,
                heartRate: patientData.heartRate || null,
                respiratoryRate: patientData.respiratoryRate || null, 
                bmi: bmi,
                bloodPressure: patientData.bloodPressure || "",
                drugAllergy: medicalHistoryFromForm,
            };

            const prescriptionItemsPayload = prescriptionItems.map(item => {
                const dosageText = item.medicineName?.match(/\d+mg/)?.[0] || "N/A";
                return {
                    medicineId: item.medicineId,
                    quantity: item.quantity,
                    dosage: dosageText, 
                    usageInstruction: item.usageInstruction,
                }
            });
            
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
                        return;
                    }
                    const data = res.payload;
                    if (!data || data.success === false) { 
                        messageApi.error("Không thể lưu thông tin khám bệnh! " + (data?.message || ""));
                        return;
                    }
                    messageApi.success("Khám bệnh đã được lưu thành công!");
                    setSuccessPayload({
                        ...payload,
                        totalAmount: totalAmount,
                        prescriptionItems: prescriptionItems,
                        medicationDays: medicationDays,
                    });
                })
                .catch((err) => {
                    messageApi.error("Có lỗi xảy ra khi lưu hồ sơ!");
                });

        } catch (errorInfo) {
            message.error("Vui lòng nhập đầy đủ các trường bắt buộc.");
        }
    };
    
    // ⭐️ Ctrl+S → submit hồ sơ
    useEffect(() => {
        const handleCtrlS = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
        };
        window.addEventListener('keydown', handleCtrlS);
        return () => window.removeEventListener('keydown', handleCtrlS);
    }, [currentPatient, isNewPatientMode, prescriptionItems, medicationDays]);

    const totalAmount = prescriptionItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

    if (successPayload) {
        return <ExaminationSuccessScreen 
            payload={successPayload} 
            totalAmount={successPayload.totalAmount} 
            medicationDays={successPayload.medicationDays}
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
                    <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} title="Lưu hồ sơ (Ctrl+S)">
                        Lưu Hồ Sơ & Kê Đơn <span style={{ fontSize: 11, opacity: 0.75, marginLeft: 4 }}>(Ctrl+S)</span>
                    </Button>
                </Space>
            </Header>
            
            <Content style={{ padding: '10px 24px' }}>
                <div style={{ padding: '10px', background: '#fff' }}>
                    
                    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                        
                        {/* CỘT TRÁI */}
                        <Col span={11}>
                            <Card 
                                title={<><UserOutlined /> Thông Tin & Chỉ Số Cơ Bản</>} 
                                size="small"
                                bordered={false}
                            >
                                <Form layout="vertical" form={form}>
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item label="Mã BN" name="patientCode">
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

                                {isNewPatientMode ? (
                                    <Card size="small" type="inner" title="Nhập Thông Tin Bệnh Nhân Mới" style={{ marginBottom: 10 }}>
                                        <Form 
                                            form={form} 
                                            layout="vertical"
                                            onValuesChange={(changedValues, allValues) => {
                                                if (changedValues.dateOfBirth) {
                                                    const dob = changedValues.dateOfBirth?.format('DD/MM/YYYY');
                                                    const age = calculateAge(changedValues.dateOfBirth?.format('YYYY-MM-DD'));
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
                                                    <Form.Item name="gender" label="Giới tính" initialValue="male" rules={[{ required: true, message: 'Chọn GT!' }]}>
                                                        <Select>
                                                            <Option value="male">Nam</Option>
                                                            <Option value="female">Nữ</Option>
                                                        </Select>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={12}>
                                                    <Form.Item name="dateOfBirth" label="Ngày sinh" rules={[{ required: true, message: 'Chọn NS!' }]}>
                                                        <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
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
                                    <Descriptions bordered size="small" column={3}>
                                        <Descriptions.Item label='Họ Tên' span={3}>
                                            <Title level={5} style={{ margin: 0 }}>{currentPatient.fullName}</Title>
                                        </Descriptions.Item>
                                        <Descriptions.Item label='Tuổi/GT' span={1}>
                                            {currentPatient.patientAgeAtVisit} / {
                                                currentPatient.gender 
                                                    ? (currentPatient.gender.toLowerCase() === 'male' ? 'Nam' : 'Nữ') 
                                                    : 'N/A'
                                            }
                                        </Descriptions.Item>
                                        <Descriptions.Item label='Ngày Sinh' span={2}>
                                            {currentPatient.dateOfBirth ? moment(currentPatient.dateOfBirth).format('DD/MM/YYYY') : 'N/A'}
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
                                )}

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

                        {/* CỘT PHẢI */}
                        <Col span={13}>
                            <Card title={<><HeartOutlined /> Khám Lâm Sàng & Chẩn Đoán</>} size="small" bordered={false} style={{ height: '100%' }}>
                                <Form layout="vertical" form={form}>
                                    <Form.Item name="symptoms" label="Triệu Chứng/Tình trạng hiện tại">
                                        <TextArea rows={2} placeholder="Ho, sốt, đau họng..." />
                                    </Form.Item>
                                    <Form.Item 
                                        name="clinicalFindings" 
                                        label="Khám Lâm Sàng" 
                                        rules={[{ required: true, message: 'Nhập kết quả khám lâm sàng!' }]}
                                    >
                                        <TextArea rows={2} placeholder="Họng đỏ, phổi thông khí tốt..." />
                                    </Form.Item>
                                    <Form.Item name="diagnosis" label="Chẩn Đoán" rules={[{ required: true, message: 'Nhập chẩn đoán!' }]}>
                                        <Input placeholder="Viêm họng cấp do virus" />
                                    </Form.Item>
                                    <Form.Item name="treatment" label="Hướng Dẫn Điều Trị">
                                        <TextArea rows={1} placeholder="Điều trị kháng viêm, hạ sốt, nghỉ ngơi..." />
                                    </Form.Item> 
                                    <Form.Item name="notes" label="Ghi Chú Chung">
                                        <TextArea rows={1} placeholder="Lưu ý: Hẹn tái khám sau 3 ngày." />
                                    </Form.Item>
                                    <Divider orientation="left" style={{ margin: '10px 0' }}>Thông số bổ sung</Divider>
                                    <Row gutter={16}>
                                        <Col span={8}>
                                            <Form.Item name="weightKg" label="Cân Nặng (kg)" rules={[{ required: true, message: "Vui lòng nhập cân nặng" }]}>
                                                <InputNumber min={1} step={0.1} style={{ width: '100%' }} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item name="heightCm" label="Chiều Cao (cm)" >
                                                <InputNumber min={50} step={0.1} style={{ width: '100%' }} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item name="respiratoryRate" label="Nhịp Thở (l/phút)" initialValue={18}>
                                                <InputNumber min={1} style={{ width: '100%' }} />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item name="nextAppointmentDate" label="Ngày Tái Khám">
                                                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item name="medicalHistory" label="Tiền Sử">
                                                <Input placeholder="Ví dụ: Dị ứng Penicillin, tiểu đường..." />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Form>
                            </Card>
                        </Col>
                    </Row>
                    
                    {/* HÀNG 2: KÊ ĐƠN THUỐC */}
                    <Card title={<><MedicineBoxOutlined /> Kê Đơn Thuốc Hiện Tại</>} size="small" bordered={false}>
                        <Row gutter={16} style={{ marginBottom: 10 }}>
                            <Col span={6}>
                                <Form.Item label="Số Ngày Uống Thuốc" style={{ marginBottom: 0 }}>
                                    <InputNumber 
                                        min={1} 
                                        value={medicationDays}
                                        onChange={handleMedicationDaysChange}
                                        style={{ width: '100%' }}
                                        placeholder="Nhập số ngày"
                                    />
                                </Form.Item>
                                <div style={{ fontSize: '0.85em', color: '#666', marginTop: 4 }}>
                                    Ngày tái khám sẽ tự động tính: {moment().add(medicationDays, 'days').format('DD/MM/YYYY')}
                                </div>
                            </Col>
                        </Row>
                        
                        {/* Form thêm/chỉnh sửa thuốc với MedicineSearchSelect */}
                        <Form 
                            form={medicineForm} 
                            onFinish={editingKey !== null ? onSaveEdit : onAddMedicine} 
                            layout="inline" 
                            style={{ marginBottom: 10, padding: '10px', border: '1px dashed #ccc', borderRadius: 4 }}
                        >
                            <Form.Item
                                name="medicineId"
                                label="Thuốc"
                                rules={[{ required: true, message: 'Chọn thuốc!' }]}
                            >
                                <MedicineSearchSelect
                                    medicines={mockMedicines}
                                    value={selectedMedicineId}
                                    onChange={(id) => {
                                        setSelectedMedicineId(id);
                                        medicineForm.setFieldsValue({ medicineId: id });
                                    }}
                                    disabled={editingKey !== null}
                                    inputRef={medicineInputRef}
                                />
                            </Form.Item>
                            
                            <Form.Item name="morning" label="Sáng">
                                <InputNumber min={0} step={0.25} style={{ width: 60 }} onChange={handleDosageChange} />
                            </Form.Item>
                            <Form.Item name="noon" label="Trưa">
                                <InputNumber min={0} step={0.25} style={{ width: 60 }} onChange={handleDosageChange} />
                            </Form.Item>
                            <Form.Item name="afternoon" label="Chiều">
                                <InputNumber min={0} step={0.25} style={{ width: 60 }} onChange={handleDosageChange} />
                            </Form.Item>
                            <Form.Item name="evening" label="Tối">
                                <InputNumber min={0} step={0.25} style={{ width: 60 }} onChange={handleDosageChange} />
                            </Form.Item>
                            
                            <Form.Item name="quantity" label="Tổng SL" rules={[{ required: true, message: 'SL tự động!' }]}>
                                <InputNumber disabled style={{ width: 70 }} />
                            </Form.Item>
                            
                            <Form.Item name="note" label="Ghi chú">
                                <Input placeholder="..." style={{ width: 150 }} />
                            </Form.Item>
                            
                            <Form.Item>
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
                            rowClassName={(record) => record.key === editingKey ? 'ant-table-row-selected' : ''}
                        />
                        
                        <div style={{ textAlign: 'right', marginTop: 10, paddingRight: 20, fontSize: '1.2em', fontWeight: 'bold', color: '#08979c' }}>
                            {/* TỔNG TIỀN THUỐC: {totalAmount.toLocaleString('vi-VN')}đ */}
                        </div>
                        
                        {medicalHistory.length > 0 && <OldPrescriptionHistory history={medicalHistory} />}
                    </Card>
                </div>
            </Content>

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