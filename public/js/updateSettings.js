/*eslint-disable*/
import { showAlert } from './alerts';
import axios from 'axios';
export const updateSettings = async (data, type) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url:
        type === 'password'
          ? 'http://localhost:3000/api/v1/users/updatePassword'
          : 'http://localhost:3000/api/v1/users/updateMe',
      data
    });
    console.log(res.data.status === 'success');
    if (res.data.status === 'success') {
      console.log('nodick');
      showAlert('success', `${type.toUpperCase()} data successfully updated`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
