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
    let input = document.getElementById('code_input_1') as HTMLInputElement;
    input.focus();
    if (this.rx.user$.value.security?.login) {
      this.sandbox_message = this.rx.user$.value.security.login._sandbox? `You are in sandbox, just enter :${this.rx.user$.value.security.login._otp_value}`:"";
    }
  }

  update_code(e: Event, i: number) {
    if (i < 6) {
      let input = document.getElementById('code_input_' + (i + 1)) as HTMLInputElement;
      input.focus();
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
      if (res.success && res.data) {
        var user: IDBContact = res.data
        this.rx.user$.next(user);
        // if user passed otp continue to sequence
        if (user.security.login.otp_passed) {
          this.success = "correct";
          this.login_serv.login_register_sequence();
          this.router.navigateByUrl("/auth/login-with-pin")
        }

      }
    })
  }

}
