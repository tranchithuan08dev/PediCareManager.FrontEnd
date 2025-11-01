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
   
}
export default checkAttendanceService;