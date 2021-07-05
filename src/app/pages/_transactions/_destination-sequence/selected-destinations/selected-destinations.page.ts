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
    this.rx.temp.view_transaction = this.walletSrv.convert_rxtran_to_transaction(this.rx.temp["transaction"])
    console.log("this.rx.temp.view_transaction");
    console.log(this.rx.temp.view_transaction);
    console.log(JSON.stringify(this.rx.temp.view_transaction));

    this.router.navigateByUrl("/action/complete-transaction")
  }

  add_destination() {
    this.router.navigateByUrl("transaction/destinations-sequence/available-destinations");
  }

  edit_destination(destination: any) {
    this.router.navigateByUrl("/transaction/destinations-sequence/destination?payment_method=" + encodeURIComponent(destination.payment_method.type) + "&category=" + encodeURIComponent(destination.metadata.category) + "&image=" + encodeURIComponent(destination.metadata.image) + "&name=" + encodeURIComponent(destination.metadata.name))
  }

  get remaing_ballance() {
    return (this.sources_amount as any) - (this.destination_amount as any)
  }
}
