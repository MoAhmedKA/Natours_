/*eslint-disable*/
import { showAlert } from './alerts';
import axios from 'axios';
export const updateSettings = async (data, type) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url:
        type === 'password'
          ? 'api/v1/users/updatePassword'
          : 'api/v1/users/updateMe',
      data
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} data successfully updated`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
