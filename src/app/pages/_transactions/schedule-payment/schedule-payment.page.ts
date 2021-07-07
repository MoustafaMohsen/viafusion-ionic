import { Router } from '@angular/router';
import { RX } from 'src/app/services/rx/events.service';
import { SchedualService } from './../../../services/schedual/schedual.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-schedule-payment',
  templateUrl: './schedule-payment.page.html',
  styleUrls: ['./schedule-payment.page.scss'],
})
export class SchedulePaymentPage implements OnInit {

  constructor(private schedSrv: SchedualService, private rx: RX,private router:Router) { }

  action_form = new FormGroup({
    value: new FormControl("7"),
    every: new FormControl("day", [Validators.required]),
    done_count: new FormControl("2"),
    meta: new FormControl("For my family"),
  })
  ngOnInit() {
  }

  save_btn() {
    this.schedSrv.create_db_action({
      ...this.action_form.value,
      type: "transaction",
      date: new Date().getTime() / 1000,
      active: true
    }).then(res => {
      console.log(res);
      this.rx.toast("Transaction Schadualed");
      this.router.navigateByUrl("dashboard")
    }).catch(e => console.error(e))
  }

}
