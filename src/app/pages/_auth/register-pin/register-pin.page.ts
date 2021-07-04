import { RX } from 'src/app/services/rx/events.service';
import { LoginService } from 'src/app/services/auth/login.service';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingService } from 'src/app/services/loading.service';
import { IDBContact } from 'src/app/interfaces/db/idbcontact';

@Component({
  selector: 'app-register-pin',
  templateUrl: './register-pin.page.html',
  styleUrls: ['./register-pin.page.scss'],
})
export class RegisterPinPage implements OnInit {
  pin: number[] = [];
  success: "correct" | "incorrect" | "init" = "init";
  @Input() router_target: "/auth/confirm-pin" | "/dashboard" = "/auth/confirm-pin"
  @Input() action: "login_with_pin" | "register_pin" | "confirm_pin" = "login_with_pin"
  @Input() confirm_code: string = "";
  sandbox_message = ""

  constructor(public loading: LoadingService, private router: Router, private login_serv:LoginService, private rx:RX) { }

  ngOnInit() {
  }
  update_code(e: Event, i: number) {
    let next_input = document.getElementById('code_input_' + (i + 1)) as HTMLInputElement;
    let current_input = document.getElementById('code_input_' + (i)) as HTMLInputElement;
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
    this.rx.temp["confirm-pin"] = code;
    this.router.navigateByUrl("/auth/confirm-pin")
  }

}
