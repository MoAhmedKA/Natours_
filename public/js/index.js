/* eslint-disable */
import { updateSettings } from './updateSettings';
import { logout } from '/login';
import '@babel/polyfill';
import { bookTour, stripe } from './stripe';
import { displayMap } from './mapbox';
import { login } from './login';
import { update } from '../../userModel';
import catchAsync from '../../catchAsync';
const formUpdate = document.querySelector('.form-user-data');
const formUpdateSettings = document.querySelector('.form-user-settings');
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const bookBtn = document.getElementById('book-tour');
const logoutBtn = document.querySelector('.nav__el--logout');
if (bookBtn) {
  bookBtn.addEventListener('click', e => {
    bookBtn.textContent = 'Processing..';
    e.preventDefault;
    const { tourId } = bookBtn.dataset;
    bookTour(tourId);
  });
}
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  console.log('lol');
  loginForm.addEventListener('click', e => {
    console.log('no');
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });
}
if (logoutBtn) logoutBtn.addEventListener('click', logout);

if (formUpdate) {
  formUpdate.addEventListener('submit', async e => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateSettings(form, 'data');
  });
}
if (formUpdateSettings) {
  formUpdateSettings.addEventListener(
    'submit',
    catchAsync(async e => {
      e.preventDefault();
      document.querySelector('.btn--save-password').textContent = 'Updating...';

      const currentPassword = document.getElementById('password-current').value;
      const passwordConfirm = document.getElementById('password-confirm').value;
      const password = document.getElementById('password').value;

      await updateSettings(
        { password, passwordConfirm, currentPassword },
        'password'
      );
      document.querySelector('.btn--save-password').textContent =
        'save password';

      document.getElementById('password-current').value = '';
      document.getElementById('password-confirm').value = '';
      document.getElementById('password').value = '';
    })
  );
}
