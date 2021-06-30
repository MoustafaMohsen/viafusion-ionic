import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.page.html',
  styleUrls: ['./verification.page.scss'],
})
export class VerificationPage implements OnInit {

  progress_percent = 20;
  radius = 100;
  subtitle = "Progress"
  constructor() { }

  ngOnInit() {
  }

}
