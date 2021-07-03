import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-verify-card',
  templateUrl: './verify-card.page.html',
  styleUrls: ['./verify-card.page.scss'],
})
export class VerifyCardPage implements OnInit {
  progress_percent = 50;
  radius = 100;
  subtitle = "card" 

  constructor() { }

  ngOnInit() {
  }
  submit(){}

}
