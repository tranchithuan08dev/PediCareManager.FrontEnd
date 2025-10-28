import API from './api';

const authService = {
    login: function (data) {
        return API.call().post('Auth/login', data);
    },
}
export default authService;