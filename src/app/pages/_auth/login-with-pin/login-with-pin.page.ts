import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-login-with-pin',
  templateUrl: './login-with-pin.page.html',
  styleUrls: ['./login-with-pin.page.scss'],
})
export class LoginWithPinPage implements OnInit {
  otp: number[] = [];
  success:"correct" | "incorrect" | "init" = "init" ;

  constructor() { }

  ngOnInit() {
  }
 

}