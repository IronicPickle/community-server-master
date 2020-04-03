
export function login(password: string): object {
  const devPassword = process.env.ADMIN_PASS;
  var authStatus = {invalid: true, err: ""};

  if(devPassword) {
    authStatus.invalid = password != devPassword;
    if(authStatus.invalid) authStatus.err = "Incorrect password";
  } else {
    authStatus.err = "Password not configured";
  }
  return authStatus;
}