import { WalletService } from './../../../../services/wallet/wallet.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { LoadingService } from 'src/app/services/loading.service';
import { RX } from 'src/app/services/rx/events.service';
import { ICreatePayout } from 'src/app/interfaces/rapyd/ipayout';


@Component({
  selector: 'app-destinations-page',
  templateUrl: './selected-destinations.page.html',
  styleUrls: ['./selected-destinations.page.scss'],
})
export class SelectedDestinationsPage implements OnInit {

  destination_item = {
    name: "wallet",
    description: "",
    start_date: new Date(),
  };
  selected_destinations: ICreatePayout.Request[] = [];
  destination_amount = "0"
  sources_amount = "0"

  constructor(private loading: LoadingService, private router: Router, private rx: RX, private walletSrv: WalletService) { }

  ionViewWillEnter() {
    this.sources_amount = this.rx.temp["transaction"].source_amount
  }
  ionViewDidEnter() {
    setTimeout(() => {
      if (this.sources_amount < (1 as any)) {
        this.router.navigateByUrl("transaction/sources-sequence/selected-sources");
      }
    }, 2000);
  }
  ngOnInit() {
    this.selected_destinations = this.rx.temp["transaction"]["payouts"].value;
    this.rx.temp.transaction.payouts.subscribe(d => {
      this.selected_destinations = d;
      // calculate destination total
      this.destination_amount = this.rx.temp["transaction"].destination_amount = this.selected_destinations.map(s => s.payout_amount).reduce((a, b) => a + b, 0)
        + "" || 0 + "";

    })
  }
  continue_to_destination() {
    // this.rx.save_temp();
    this.rx.temp.view_transaction.next(this.walletSrv.convert_rxtran_to_transaction(this.rx.temp["transaction"]))
    console.log("this.rx.temp.view_transaction");

    this.router.navigateByUrl("/action/complete-transaction")
  }

  add_destination() {
    this.router.navigateByUrl("transaction/destinations-sequence/available-destinations");
  }

  delete_destination(destination: ICreatePayout.Request) {
    this.selected_destinations = this.rx.temp["transaction"]["payouts"].value;
    for (let i = 0; i < this.selected_destinations.length; i++) {
      const dest = this.selected_destinations[i];
      if (dest.payout_amount == destination.payout_amount && dest.payout_currency == destination.payout_currency && dest.payout_method_type == destination.payout_method_type) {
        this.selected_destinations.splice(i, 1)
      }
    }
    this.rx.temp["transaction"]["payouts"].next(this.selected_destinations);
  }

  get remaing_ballance() {
    return (this.sources_amount as any) - (this.destination_amount as any)
  }
}
