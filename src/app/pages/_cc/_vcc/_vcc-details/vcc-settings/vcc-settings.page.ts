import { LoadingService } from './../../../../../services/loading.service';
import { Component, OnInit } from '@angular/core';
import { ListIssuedVcc, ListIssuedVccTransactions } from 'src/app/interfaces/rapyd/ivcc';
import { RX } from 'src/app/services/rx/events.service';
import { VccService } from 'src/app/services/vcc/vcc.service';

@Component({
  selector: 'app-vcc-settings',
  templateUrl: './vcc-settings.page.html',
  styleUrls: ['./vcc-settings.page.scss'],
})
export class VccSettingsPage implements OnInit {

  constructor(private vccSrv: VccService, private rx: RX, public loading:LoadingService) { }

  card_details: ListIssuedVcc.Response;
  ionViewWillEnter() {
    this.card_details = this.rx.temp.vcc_details


  }
  ngOnInit() {

  }
  ionViewWillLeave() {
    console.log("ionViewWillLeave()");
  }

  toggle_activate_card() {
    this.loading.start()
    if (this.card_details.status == "ACT") {
      this.vccSrv.set_card_status({card:this.card_details.id,status:"block"}).subscribe(r=>{
        this.loading.stop()
        if (r.success) {
          this.rx.toast("Updated")
        }else{
          this.rx.toastError(r as any)
        }
      },err=>{
        console.error(err);
        this.loading.stop()
      })
    }
    if (this.card_details.status == "BLO") {
      this.vccSrv.set_card_status({card:this.card_details.id,status:"unblock"}).subscribe(r=>{
        this.loading.stop()
        if (r.success) {
          this.rx.toast("Updated")
        }else{
          this.rx.toastError(r as any)
        }
      },err=>{
        console.error(err);
        this.loading.stop()
      })
    }
  }
  get status() {
    return this.vccSrv.card_status(this.card_details)
  }

}
