import { Injectable } from '@angular/core';
import { Api } from '../api/api';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private api: Api) {
  }

  send_login(phone_number) {
    let login = {
      phone_number,
      security: "{}"
    }

    this.api.post("login", login).subscribe((res) => {
      console.log(res);

    })
  }
}
