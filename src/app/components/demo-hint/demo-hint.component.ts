import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DEMO_OTP, DEMO_PHONE, DEMO_PHONE_DISPLAY, DEMO_PIN } from 'src/app/services/demo/demo-data';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-demo-hint',
  templateUrl: './demo-hint.component.html',
  styleUrls: ['./demo-hint.component.scss'],
})
export class DemoHintComponent {

  @Input() step: "phone" | "otp" | "pin" | "sources" | "destinations" | "recipient" | "recipients" = "phone";
  /** emits when the visitor asks for the sample values: the sample phone number on the phone step, an empty string elsewhere */
  @Output() use_sample = new EventEmitter<string>();

  demo = environment.demo;
  phone = DEMO_PHONE_DISPLAY;
  otp = DEMO_OTP;
  pin = DEMO_PIN;

  constructor() { }

  fill_phone() {
    this.use_sample.emit(DEMO_PHONE);
  }

  fill_sample() {
    this.use_sample.emit("");
  }
}
