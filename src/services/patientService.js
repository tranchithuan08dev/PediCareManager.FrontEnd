import API from './api';

const patientService = {
    getAll: function () {
        return API.callWithToken().get('Patients');
    },
    getDetail:function (id) {
        return API.callWithToken().get(`Patients/${id}`);
    },
    getHistory:function (patientCode) {
        return API.callWithToken().get(`Patients/history?patientCode=${patientCode}`);
    },
  
}
export default patientService;