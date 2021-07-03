import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-verify-wallet',
  templateUrl: './verify-wallet.page.html',
  styleUrls: ['./verify-wallet.page.scss'],
})
export class VerifyWalletPage implements OnInit {
  progress_percent = 80;
  radius = 100;
  subtitle = "Wallet" 
  constructor() { }

  ngOnInit() {
  }

  submit(){}
}
