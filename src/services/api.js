import axios from 'axios';

const API = {
  call: function () {
    return axios.create({
      baseURL: 'https://localhost:7242/api/',
    });
  },
 
};

export default API;
