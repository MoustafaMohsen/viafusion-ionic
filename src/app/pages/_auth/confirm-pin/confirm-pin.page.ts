import { RX } from 'src/app/services/rx/events.service';
import { LoginService } from 'src/app/services/auth/login.service';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingService } from 'src/app/services/loading.service';
import { IDBContact } from 'src/app/interfaces/db/idbcontact';

@Component({
  selector: 'app-confirm-pin',
  templateUrl: './confirm-pin.page.html',
  styleUrls: ['./confirm-pin.page.scss'],
})
export class ConfirmPinPage implements OnInit {
  pin: number[] = [];
  success: "correct" | "incorrect" | "init" = "init";
  sandbox_message = ""

  constructor(public loading: LoadingService, private router: Router, private login_serv: LoginService, private rx: RX) { }

  ngOnInit() {
    setTimeout(() => {
      if (!this.rx.temp["confirm-pin"] && this.rx.temp["confirm-pin"] != "000000") {
        console.log("user DOESN'T HAVE pin");
        this.router.navigateByUrl("/auth/register-pin");
      }
    }, 1500);
  }
  update_code(e: Event, i: number) {
    let next_input = document.getElementById('confirm_code_input_' + (i + 1)) as HTMLInputElement;
    let current_input = document.getElementById('confirm_code_input_' + (i)) as HTMLInputElement;
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
    let code = this.pin.join("");
    console.log("this.pin");
    console.log(this.pin);
    console.log("code");
    console.log(code);
    if (this.rx.temp["confirm-pin"] != code) {
      this.success = "incorrect";
      return ;
    }
    this.loading.start();
    this.login_serv.set_pin(code).subscribe((res) => {
      if (res.success && res.data) {
        var user: IDBContact = res.data
        this.rx.user$.next(user);
        this.login_serv.confirm_pin(code).subscribe(r => {
          this.loading.stop();
          if (r.success && r.data) {
            var user: IDBContact = r.data
            this.rx.user$.next(user);
            // if user passed pin continue to sequence
            if (user.security.login.pin_passed) {
              this.success = "correct";
              this.router.navigateByUrl("/verification/verify-wallet")
            } else {
              this.success = "incorrect";
              this.sandbox_message = `You are in sandbox, just enter :${this.rx.user$.value.security.login._pin_value}`;
              console.log(this.sandbox_message);
            }
          }
        })
      }
    })
  }

}
