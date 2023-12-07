/*eslint-disable */
import { showAlert } from './alerts';

import axios from 'axios';
export const bookTour = async tourId => {
  try {
    const stripe = Stripe(
      ' pk_test_51OIAWQFIeC3jKQHFeSv5gC0kOTJZm3Bpqe449x9t6WSweGB3CrvmDjjbCmrxykfzEhrZWL7CP9n4D4vHMNZHDDzU00Xikc2xQS'
    );
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    if (session.data.status === 'success') {
      showAlert(
        'success',
        'Redirecting To CheckOut page!. (this may take a while)'
      );
    }
    if (session) {
      window.location.replace(session.data.session.url);
    }
    // await stripe.redirectToCheckOut({ sessionId: session.data.session.id });
  } catch (err) {
    showAlert('error', err);
  }
};
