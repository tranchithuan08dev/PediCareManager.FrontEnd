import { data } from 'react-router-dom';
import API from './api';

const patientService = {
    getAll: function () {
        return API.callWithToken().get('Patients');
    },
    udaptePatient: function (id,data){
       return API.callWithToken().put(`Patients/${id}`,data);
    },
    getDetail:function (id) {
        return API.callWithToken().get(`Patients/${id}`);
    },
    getHistory:function (patientCode) {
        return API.callWithToken().get(`Patients/history?patientCode=${patientCode}`);
    },
    searchPatient: function (key) {
        return API.callWithToken().get(`Patients/search?keyword=${key}`);
    },
  
}
export default patientService;