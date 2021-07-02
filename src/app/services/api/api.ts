import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { IAPIServerResponse } from 'src/app/interfaces/types';

@Injectable({
  providedIn: 'root'
})
export class Api {
  url: string = 'http://localhost:3005';

  constructor(public http: HttpClient) {
  }

  get(endpoint: string, params?: any, reqOpts?: any) {
    let url = this.url + '/' + endpoint;
    if (endpoint.indexOf('http') == 0) {
      url = endpoint;
    }

    if (!reqOpts) {
      reqOpts = {
        params: new HttpParams()
      };
    }

    // Support easy query params for GET requests
    if (params) {
      reqOpts.params = new HttpParams();
      for (let k in params) {
        // reqOpts.params.set(k, params[k]);
        reqOpts.params = reqOpts.params.append(k, params[k]);
      }
    }
    reqOpts.withCredentials = true


    return this.http.get(url, reqOpts);
  }

  post<T>(endpoint: string, body: any) {
    let url = this.url + '/' + endpoint;
    if (endpoint.indexOf('http') == 0) {
      url = endpoint;
    }
    return this.http.post<IAPIServerResponse<T>>(url, body);
  }

  put(endpoint: string, body: any, reqOpts?: any) {
    let url = this.url + '/' + endpoint;
    if (endpoint.indexOf('http') == 0) {
      url = endpoint;
    }
    return this.http.put(url + '/' + endpoint, body, reqOpts);
  }

  delete(endpoint: string, reqOpts?: any) {
    let url = this.url + '/' + endpoint;
    if (endpoint.indexOf('http') == 0) {
      url = endpoint;
    }
    return this.http.delete(url + '/' + endpoint, reqOpts);
  }

  patch(endpoint: string, body: any, reqOpts?: any) {
    let url = this.url + '/' + endpoint;
    if (endpoint.indexOf('http') == 0) {
      url = endpoint;
    }
    return this.http.put(url + '/' + endpoint, body, reqOpts);
  }
}
