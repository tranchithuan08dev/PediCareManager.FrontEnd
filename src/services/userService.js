import API from './api';

const userService = {
    getAll: function () {
        return API.callWithToken().get('users');
    },
    getDetail:function (id) {
        return API.callWithToken().get(`users/${id}`);
    },
}
export default userService;