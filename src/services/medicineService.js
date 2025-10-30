import API from './api';

const medicineService = {
    getAll: function () {
        return API.callWithToken().get('Medicine');
    },
    getDetail:function (id) {
        return API.callWithToken().get(`Medicine/${id}`);
    },
    getMedicalRecords:function (id) {
        return API.callWithToken().get(`medical-records/${id}`);
    },
}
export default medicineService;