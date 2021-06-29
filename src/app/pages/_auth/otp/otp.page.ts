import { Router } from '@angular/router';
import { LoadingService } from '../../../services/loading.service';
import { AfterViewInit, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.page.html',
  styleUrls: ['./otp.page.scss'],
})
export class OtpPage implements OnInit, AfterViewInit {

  otp: number[] = [];
  success:"correct" | "incorrect" | "init" = "init" ;
  constructor(public loading: LoadingService, private router: Router) { }

  ngOnInit() {
    this.otp;
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    let input = document.getElementById('code_input_1') as HTMLInputElement;
    input.focus();
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
      this.router.navigateByUrl('dashboard');
    }, 1000);
  }

}
