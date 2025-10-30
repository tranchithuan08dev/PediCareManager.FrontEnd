import API from './api';

const examinationService = {
    postExamination: function (data) {
        return API.callWithToken().post('Examination',data);
    },
    
}
export default examinationService;