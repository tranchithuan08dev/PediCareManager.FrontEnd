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
    changeQuanlity: function (data) {
        return API.callWithToken().post(`Medicine/${data.medicineId}/transactions`,data);
    },
    updateMedicine: function (data) {
        return API.callWithToken().put(`Medicine/${data.id}`,data);
    },
    postMedicine:function (data) {
        return API.callWithToken().post(`Medicine`,data);
    },
}
export default medicineService;