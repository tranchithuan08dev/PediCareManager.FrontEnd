import React, { useState, useCallback } from 'react';
import {
    DatePicker,
    Button,
    Card,
    Typography,
    Space,
    Alert,
    Spin,
    Tag,
    Row,
    Col,
} from 'antd';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    ReferenceLine,
} from 'recharts';
import {
    BarChartOutlined,
    CalendarOutlined,
    MedicineBoxOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import API from '../../services/api';

dayjs.extend(isBetween);

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

/* ─────────────────────────── Custom Tooltip ─────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const value = payload[0].value;
        return (
            <div
                style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    padding: '12px 18px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
                    minWidth: 160,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <CalendarOutlined style={{ color: '#3b82f6', fontSize: 13 }} />
                    <Text style={{ color: '#94a3b8', fontSize: 12 }}>Ngày khám</Text>
                </div>
                <Text strong style={{ color: '#1e293b', fontSize: 14, display: 'block', marginBottom: 8 }}>
                    {label}
                </Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MedicineBoxOutlined style={{ color: '#10b981', fontSize: 13 }} />
                    <Text style={{ color: '#64748b', fontSize: 12 }}>Tổng số ca: </Text>
                    <Text strong style={{ color: '#10b981', fontSize: 18 }}>{value}</Text>
                </div>
            </div>
        );
    }
    return null;
};

/* ─────────────────────────── Helpers ─────────────────────────── */
const generateDateRange = (start, end) => {
    const dates = [];
    let current = dayjs(start);
    const last = dayjs(end);
    while (current.isSame(last) || current.isBefore(last)) {
        dates.push(current.format('YYYY-MM-DD'));
        current = current.add(1, 'day');
    }
    return dates;
};

const getBarColor = (value, maxValue) => {
    const intensity = maxValue > 0 ? value / maxValue : 0;
    if (intensity >= 0.9) return '#10b981'; // xanh lá — cao
    if (intensity >= 0.5) return '#3b82f6'; // xanh dương — trung bình
    return '#a5b4fc';                        // tím nhạt — thấp
};

/* ─────────────────────────── Main Component ─────────────────────────── */
const DailyVisitChart = () => {
    const [dates, setDates] = useState([dayjs().subtract(7, 'day'), dayjs()]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fetchProgress, setFetchProgress] = useState({ done: 0, total: 0 });
    const [hasLoaded, setHasLoaded] = useState(false);

    const fetchChartData = useCallback(async () => {
        if (!dates || dates.length !== 2) {
            setError('Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.');
            return;
        }

        setLoading(true);
        setError(null);
        setChartData([]);
        setHasLoaded(false);

        const dateList = generateDateRange(dates[0], dates[1]);
        setFetchProgress({ done: 0, total: dateList.length });

        let doneCount = 0;

        const promises = dateList.map(async (date) => {
            try {
                const res = await API.call().get(
                    `medical-records/daily-revenue?startDate=${date}&endDate=${date}`
                );
                doneCount += 1;
                setFetchProgress({ done: doneCount, total: dateList.length });
                return {
                    date,
                    label: dayjs(date).format('DD/MM'),
                    totalCases: res.data?.totalMedicalRecords ?? 0,
                };
            } catch {
                doneCount += 1;
                setFetchProgress({ done: doneCount, total: dateList.length });
                return { date, label: dayjs(date).format('DD/MM'), totalCases: 0 };
            }
        });

        const results = await Promise.all(promises);
        results.sort((a, b) => a.date.localeCompare(b.date));
        setChartData(results);
        setHasLoaded(true);
        setLoading(false);
    }, [dates]);

    const totalCases = chartData.reduce((s, d) => s + d.totalCases, 0);
    const maxDay = chartData.reduce((m, d) => (d.totalCases > m.totalCases ? d : m), { totalCases: 0 });
    const avgCases = chartData.length > 0 ? (totalCases / chartData.length).toFixed(1) : 0;
    const maxValue = maxDay.totalCases;

    return (
        <div
            style={{
                minHeight: '100vh',
                background: '#f8fafc',
                padding: '32px 24px',
                fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
            }}
        >
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <div
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                        }}
                    >
                        <BarChartOutlined style={{ color: '#fff', fontSize: 20 }} />
                    </div>
                    <div>
                        <Title
                            level={2}
                            style={{
                                margin: 0,
                                color: '#0f172a',
                                fontSize: 24,
                                fontWeight: 700,
                                letterSpacing: '-0.5px',
                            }}
                        >
                            Biểu Đồ Ca Khám Theo Ngày
                        </Title>
                        <Text style={{ color: '#94a3b8', fontSize: 13 }}>
                            Thống kê số lượng ca khám bệnh theo từng ngày
                        </Text>
                    </div>
                </div>
            </div>

            {/* Filter Card */}
            <Card
                style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 16,
                    marginBottom: 24,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}
                bodyStyle={{ padding: '20px 24px' }}
            >
                <Space wrap size={12}>
                    <Text style={{ color: '#475569', fontWeight: 600, fontSize: 13 }}>
                        <CalendarOutlined style={{ marginRight: 6 }} />
                        Khoảng thời gian:
                    </Text>
                    <RangePicker
                        format="DD/MM/YYYY"
                        value={dates}
                        onChange={setDates}
                        style={{ width: 280 }}
                    />
                    <Button
                        type="primary"
                        icon={<ThunderboltOutlined />}
                        onClick={fetchChartData}
                        loading={loading}
                        style={{
                            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                            border: 'none',
                            borderRadius: 8,
                            fontWeight: 600,
                            height: 36,
                            paddingInline: 20,
                            boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
                        }}
                    >
                        Xem Biểu Đồ
                    </Button>

                    {loading && fetchProgress.total > 0 && (
                        <Tag
                            color="blue"
                            style={{ borderRadius: 8, fontSize: 12, padding: '2px 10px' }}
                        >
                            Đang tải: {fetchProgress.done}/{fetchProgress.total} ngày
                        </Tag>
                    )}
                </Space>
            </Card>

            {/* Error */}
            {error && (
                <Alert
                    message="Lỗi"
                    description={error}
                    type="error"
                    showIcon
                    style={{ marginBottom: 20, borderRadius: 12 }}
                />
            )}

            {/* Loading */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 12, color: '#94a3b8' }}>
                        Đang fetch song song {fetchProgress.total} ngày...
                    </div>
                </div>
            )}

            {/* Stats + Chart */}
            {hasLoaded && !loading && (
                <>
                    <Row gutter={16} style={{ marginBottom: 24 }}>
                        {/* Tổng số ca */}
                        <Col xs={24} sm={8}>
                            <Card
                                style={{
                                    background: '#ffffff',
                                    border: '1px solid #bfdbfe',
                                    borderRadius: 14,
                                    boxShadow: '0 2px 8px rgba(59,130,246,0.08)',
                                }}
                                bodyStyle={{ padding: '18px 22px' }}
                            >
                                <Text style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
                                    Tổng Số Ca Khám
                                </Text>
                                <Text style={{ color: '#3b82f6', fontSize: 34, fontWeight: 800 }}>
                                    {totalCases}
                                </Text>
                                <Text style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginTop: 2 }}>
                                    trong {chartData.length} ngày
                                </Text>
                            </Card>
                        </Col>

                        {/* Ngày cao nhất */}
                        <Col xs={24} sm={8}>
                            <Card
                                style={{
                                    background: '#ffffff',
                                    border: '1px solid #bbf7d0',
                                    borderRadius: 14,
                                    boxShadow: '0 2px 8px rgba(16,185,129,0.08)',
                                }}
                                bodyStyle={{ padding: '18px 22px' }}
                            >
                                <Text style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
                                    Ngày Cao Nhất
                                </Text>
                                <Text style={{ color: '#10b981', fontSize: 34, fontWeight: 800 }}>
                                    {maxDay.totalCases}
                                </Text>
                                <Text style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginTop: 2 }}>
                                    ca — ngày {maxDay.label}
                                </Text>
                            </Card>
                        </Col>

                        {/* Trung bình */}
                        <Col xs={24} sm={8}>
                            <Card
                                style={{
                                    background: '#ffffff',
                                    border: '1px solid #ddd6fe',
                                    borderRadius: 14,
                                    boxShadow: '0 2px 8px rgba(99,102,241,0.08)',
                                }}
                                bodyStyle={{ padding: '18px 22px' }}
                            >
                                <Text style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
                                    Trung Bình / Ngày
                                </Text>
                                <Text style={{ color: '#6366f1', fontSize: 34, fontWeight: 800 }}>
                                    {avgCases}
                                </Text>
                                <Text style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginTop: 2 }}>
                                    ca mỗi ngày
                                </Text>
                            </Card>
                        </Col>
                    </Row>

                    {/* Chart Card */}
                    <Card
                        style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: 16,
                            boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
                        }}
                        bodyStyle={{ padding: '24px' }}
                    >
                        <div style={{ marginBottom: 20 }}>
                            <Text strong style={{ color: '#0f172a', fontSize: 16 }}>
                                📊 Số Ca Khám Từng Ngày
                            </Text>
                            <Text style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginTop: 2 }}>
                                Hover vào cột để xem chi tiết
                            </Text>
                        </div>

                        {chartData.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 0', color: '#cbd5e1' }}>
                                Không có dữ liệu trong khoảng thời gian này
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={380}>
                                <BarChart
                                    data={chartData}
                                    margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                                    barCategoryGap="30%"
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#f1f5f9"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="label"
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        axisLine={{ stroke: '#e2e8f0' }}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        content={<CustomTooltip />}
                                        cursor={{ fill: 'rgba(59,130,246,0.05)', radius: 6 }}
                                    />
                                    <ReferenceLine
                                        y={parseFloat(avgCases)}
                                        stroke="#f59e0b"
                                        strokeDasharray="6 3"
                                        label={{
                                            value: `TB: ${avgCases}`,
                                            fill: '#f59e0b',
                                            fontSize: 11,
                                            position: 'insideTopRight',
                                        }}
                                    />
                                    <Bar dataKey="totalCases" radius={[6, 6, 0, 0]} maxBarSize={56}>
                                        {chartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={getBarColor(entry.totalCases, maxValue)}
                                                fillOpacity={0.9}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}

                        {/* Legend */}
                        <div style={{ display: 'flex', gap: 20, marginTop: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                            {[
                                { color: '#10b981', label: 'Cao (≥ 90% max)' },
                                { color: '#3b82f6', label: 'Trung bình (50–90%)' },
                                { color: '#a5b4fc', label: 'Thấp (< 50%)' },
                                { color: '#f59e0b', label: 'Đường trung bình' },
                            ].map(({ color, label }) => (
                                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <div style={{ width: 12, height: 12, borderRadius: 3, background: color }} />
                                    <Text style={{ color: '#94a3b8', fontSize: 11 }}>{label}</Text>
                                </div>
                            ))}
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
};

export default DailyVisitChart;