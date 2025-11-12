import API from './api';

const checkAttendanceService = {
    checkIn: function () {
        return API.callWithToken().post('Shift/check-in');
    },
    checkOut:function () {
        return API.callWithToken().post('Shift/check-out');
    },
    checkStatus:function () {
        return API.callWithToken().get('Shift/status');
    },

    attendanceReport:function (data) {
        return API.callWithToken().get(`attendance-reports/doctor/${data.userId}/shift-details?year=${data.year}&month=${data.month}`);
    },
   
}
export default checkAttendanceService;