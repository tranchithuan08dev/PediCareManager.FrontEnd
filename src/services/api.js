import axios from 'axios';

const API = {
  call: function () {
    return axios.create({
      baseURL: 'http://wp-api.test/wp-json/',
    });
  },
 
};

export default API;
