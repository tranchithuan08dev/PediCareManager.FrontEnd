import axios from 'axios';

const API = {
  call: function () {
    return axios.create({
      baseURL: 'http://localhost:5000/api/',
    });
  },
  callWithToken: function (token) {
    if (!token) token = localStorage.getItem("ACCESS_TOKEN")
    return axios.create({
      baseURL: 'http://localhost:5000/api/',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  }
};

export default API;
