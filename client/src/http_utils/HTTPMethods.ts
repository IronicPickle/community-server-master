import requestPromise from "request-promise";

export interface GetResponse<Data> {
  success: boolean;
  msg: string;
  data?: Data;
}

export interface PostResponse<Errors> {
  success: boolean;
  msg: string;
  errors?: Errors;
}

export interface PatchResponse<Errors> {
  success: boolean;
  msg: string;
  errors?: Errors;
}

export interface DeleteResponse<Errors> {
  success: boolean;
  msg: string;
  errors?: Errors;
}

export default class HTTPMethods {

  public static async getRequest(path: string): Promise<GetResponse<any>> {
    try {
      const res = await requestPromise({
        method: "GET",
        url: `${window.location.protocol}//${window.location.host}${path}`,
        simple: false,
        headers: {
          "Content-Type": "application/json"
        }
      });
      return Promise.resolve(JSON.parse(res));
    } catch(err) {
      return Promise.resolve({ success: false, msg: "Couldn't connect to master server" });
    }
  }

  public static async postRequest(path: string, body: { [key: string]: any }): Promise<PostResponse<any>> {
    try {
      const headers: { "Content-Type": string, "CSRF-TOKEN"?: string } = {
        "Content-Type": "application/json"
      }
      if(process.env.NODE_ENV === "production") headers["CSRF-TOKEN"] = this.getCsrfToken();
      const res = await requestPromise({
        method: "POST",
        url: `${window.location.protocol}//${window.location.host}${path}`,
        simple: false,
        headers,
        body: JSON.stringify(body)
      });
      return Promise.resolve(JSON.parse(res));
    } catch(err) {
      return Promise.resolve({ success: false, msg: "Couldn't connect to master server" });
    }
  }

  public static async patchRequest(path: string, body: { [key: string]: any }): Promise<PatchResponse<any>> {
    try {
      const headers: { "Content-Type": string, "CSRF-TOKEN"?: string } = {
        "Content-Type": "application/json"
      }
      if(process.env.NODE_ENV === "production") headers["CSRF-TOKEN"] = this.getCsrfToken();
      const res = await requestPromise({
        method: "PATCH",
        url: `${window.location.protocol}//${window.location.host}${path}`,
        simple: false,
        headers,
        body: JSON.stringify(body)
      });
      return Promise.resolve(JSON.parse(res));
    } catch(err) {
      return Promise.resolve({ success: false, msg: "Couldn't connect to master server" });
    }
  }

  public static async deleteRequest(path: string): Promise<DeleteResponse<any>> {
    try {
      const headers: { "Content-Type": string, "CSRF-TOKEN"?: string } = {
        "Content-Type": "application/json"
      }
      if(process.env.NODE_ENV === "production") headers["CSRF-TOKEN"] = this.getCsrfToken();
      const res = await requestPromise({
        method: "DELETE",
        url: `${window.location.protocol}//${window.location.host}${path}`,
        simple: false,
        headers
      });
      return Promise.resolve(JSON.parse(res));
    } catch(err) {
      return Promise.resolve({ success: false, msg: "Couldn't connect to master server" });
    }
  }

  private static getCsrfToken() {
    const query = document.querySelector("meta[name='csrfToken']");
    if(query) return query.getAttribute("content") || "";
  }

}