import { Router } from '@angular/router';
import { LoadingService } from '../../../services/loading.service';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/auth/login.service';
import { IDBContact } from 'src/app/interfaces/db/idbcontact';
import { RX } from 'src/app/services/rx/events.service';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.page.html',
  styleUrls: ['./otp.page.scss'],
})
export class OtpPage implements OnInit, AfterViewInit {

  otp: number[] = [];
  sandbox_message="";
  success: "correct" | "incorrect" | "init" = "init";
  constructor(private login_serv: LoginService, public loading: LoadingService, private router: Router, private rx: RX) { }

  ngOnInit() {
    this.otp;
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    let input = document.getElementById('otp_code_input_1') as HTMLInputElement;
    input.focus();
    setTimeout(() => {
      this.sandbox_message = `You are in sandbox, just enter :${this.rx.user$.value.security.login._otp_value}`;
      console.log(this.sandbox_message);
    }, 2000);
  }

  update_code(e: Event, i: number) {
    let next_input = document.getElementById('otp_code_input_' + (i + 1)) as HTMLInputElement;
    let current_input = document.getElementById('otp_code_input_' + (i)) as HTMLInputElement;
    this.otp[i] = current_input.value as any;
    let code = this.otp.join("");
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
    let code = this.otp.join("");
    console.log("this.otp");
    console.log(this.otp);
    console.log("code");
    console.log(code);
    this.login_serv.confirm_otp(code).subscribe((res) => {
      this.loading.stop();
      if (res.success && res.data) {
        var user: IDBContact = res.data
        this.rx.user$.next(user);

        // if user passed otp continue to sequence
        if (user.security.login.otp_passed) {
          this.success = "correct";
          this.login_serv.login_register_sequence();
        }else{
          this.success = "incorrect";
          this.sandbox_message = `You are in sandbox, just enter :${this.rx.user$.value.security.login._otp_value}`;
          console.log(this.sandbox_message);

        }

      }
    })
  }

}
