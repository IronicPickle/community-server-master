
export function login(password: string): string {
  const devPassword = process.env.ADMIN_PASS;

  let err = "";
  if(devPassword) {
    if(password != devPassword) err = "Incorrect password";
  } else {
    err =  "Password not configured";
  }

  return err;

}