import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-pin-dialpad',
  templateUrl: './pin-dialpad.component.html',
  styleUrls: ['./pin-dialpad.component.scss'],
})
export class PinDialpadComponent implements OnInit {
 otp: number[] = [];
success:"correct" | "incorrect" | "init" = "init" ;
@Input() router_target: "/auth/confirm-pin" | "/dashboard" = "/auth/confirm-pin"
constructor(public loading: LoadingService, private router: Router) { }

ngOnInit() {
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
  setTimeout(() => {
    this.loading.stop();
    this.success = "correct";
    this.router.navigateByUrl(this.router_target);
  }, 1000);
}
}

