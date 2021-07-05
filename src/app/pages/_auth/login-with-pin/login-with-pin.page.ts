import { RX } from 'src/app/services/rx/events.service';
import { LoginService } from 'src/app/services/auth/login.service';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingService } from 'src/app/services/loading.service';
import { IDBContact } from 'src/app/interfaces/db/idbcontact';

@Component({
  selector: 'app-login-with-pin',
  templateUrl: './login-with-pin.page.html',
  styleUrls: ['./login-with-pin.page.scss'],
})
export class LoginWithPinPage implements OnInit  {
  pin: number[] = [];
  success: "correct" | "incorrect" | "init" = "init";
  sandbox_message = ""

  constructor(public loading: LoadingService, private router: Router, private login_serv:LoginService, private rx:RX) { }

  ngOnInit() {
  }
  update_code(e: Event, i: number) {
    let next_input = document.getElementById('login_code_input_' + (i + 1)) as HTMLInputElement;
    let current_input = document.getElementById('login_code_input_' + (i)) as HTMLInputElement;
    this.pin[i] = current_input.value as any;
    let code = this.pin.join("");
    console.log(code);

    if (code.length < 6) {
      if (current_input.value) {
        next_input && next_input.focus();
      }
    } else {
      this.submit()
    }
  }

  submit() {
    this.loading.start();
    let code = this.pin.join("");
    console.log("this.pin");
    console.log(this.pin);
    console.log("code");
    console.log(code);
    this.login_serv.confirm_pin(code).subscribe((res) => {
      this.loading.stop();
      if (res.success && res.data) {
        var user: IDBContact = res.data
        if (user.security.login.authenticated) {
          this.rx.user$.next(user);
          this.success = "correct"
          this.router.navigateByUrl("/verification/verify-wallet");
        }else{
          this.success = "incorrect";
        }
      }
    })

  }

}
