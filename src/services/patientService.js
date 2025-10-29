import API from './api';

const patientService = {
    getAll: function () {
        return API.callWithToken().get('Patients');
    },
    getDetail:function (id) {
        return API.callWithToken().get(`Patients/${id}`);
    },
  
}
export default patientService;