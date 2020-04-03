
export function login(inputs: any, callback: Function): void {
  fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }, body: JSON.stringify({
      inputs: inputs
    })
  })
    .then(res => res.json())
    .then(res => {
      var authed = !res.data.password.invalid;
      if(authed) saveToCookie(inputs.password);
      callback(res, authed);
    },
    err => {
      return;
    }
  )
}

export function saveToCookie(token: string) {
  const expiry = new Date(new Date().getTime() + (1000 * 60 * 30));
  document.cookie = `token=${token}; expires=${expiry};`;
}

export function releaseCookie() {
  document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
}

export function parseCookies() {
  var cookies: any = document.cookie;
  cookies = cookies.split(";");
  var parsedCookies: any = {};
  for(var i in cookies) {
    var splitCookie = cookies[i].split("=");
    parsedCookies[splitCookie[0]] = splitCookie[1];
  }
  return parsedCookies;
}