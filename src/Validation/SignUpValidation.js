
import showToast from "../CustomToast";

export const Signupvalidation = (data) => {
  let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
  const { full_name, email, phone_number, password } = data;
  if (!full_name) {
    showToast("error", "Please enter  Username");
    return false;
  } else if (!email) {
    showToast("error", "Please enter Email");
    return false;
  } else if (!reg.test(email)) {
    showToast("error", "Please enter Valid Email");
    return false;
  } else if (phone_number.length !== 10) {
    showToast("error", "Please enter Valid Phone number");
    return false;
  } else if (!password) {
    showToast("error", "Please enter  password");
    return false;
  }
  return true;
};
