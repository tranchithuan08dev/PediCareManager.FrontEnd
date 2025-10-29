import axios from 'axios';

const API = {
  call: function () {
    return axios.create({
      baseURL: 'https://localhost:7242/api/',
    });
  },
  callWithToken: function (token) {
    if (!token) token = localStorage.getItem("ACCESS_TOKEN")
    return axios.create({
      baseURL: 'https://localhost:7242/api/',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  }
};

export default API;
