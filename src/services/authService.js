import API from './api';

const authService = {
    login: function (data) {
        return API.call().post('Auth/login', data);
    },
    sendEmail:function (data) {
        return API.call().post('Auth/forgot-password', data);
    },
    resetPassword:function (data) {
        return API.call().post('Auth/forgot-password', data);
    },
}
export default authService;