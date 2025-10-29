import API from './api';

const medicineService = {
    getAll: function () {
        return API.callWithToken().get('Medicine');
    },
    getDetail:function (id) {
        return API.callWithToken().get(`Medicine/${id}`);
    },
  
}
export default medicineService;