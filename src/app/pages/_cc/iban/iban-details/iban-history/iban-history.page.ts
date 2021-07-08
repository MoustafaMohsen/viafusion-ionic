import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ListIssuedVcc, ListIssuedVccTransactions } from 'src/app/interfaces/rapyd/ivcc';
import { RX } from 'src/app/services/rx/events.service';
import { VccService } from 'src/app/services/vcc/vcc.service';

@Component({
  selector: 'app-iban-history',
  templateUrl: './iban-history.page.html',
  styleUrls: ['./iban-history.page.scss'],
})
export class IbanHistoryPage implements OnInit {

  constructor(private router: Router, private route: ActivatedRoute, private vccSrv: VccService, private rx: RX) { }
  card_details: ListIssuedVcc.Response;

  transactions: ListIssuedVccTransactions.Response[] = [];
  sub: Subscription
  ionViewWillEnter() {
    this.card_details = this.rx.temp.vcc_details
    this.sub = this.vccSrv.get_vcc_transactions(this.card_details.card_id).subscribe(r => {
      if (r.success) {
        this.transactions = r.data.body.data
      } else {
        console.log(r);
        this.rx.toastError(r as any);
      }
    })

  }
  ngOnInit() {

  }
  ionViewWillLeave() {
    console.log("unsubscribe()");

    this.sub.unsubscribe();
  }


  segmentChanged(e) {
    let tab = e.detail.value;
    this.router.navigate(["cc", "vcc", "vcc-details", "vcc-" + tab], { relativeTo: this.route })
    console.log(e);
    var target = e.target;
    console.log(target);
    return;


  }
}
