import { WalletService } from 'src/app/services/wallet/wallet.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ISource, TStatus as _TStatus, TSourcePoint as _TSourcePoint } from 'src/app/interfaces/interfaces';
import { PostCreatePayment } from 'src/app/interfaces/rapyd/ipayment';
import { LoadingService } from 'src/app/services/loading.service';
import { RX } from 'src/app/services/rx/events.service';
import { BehaviorSubject } from 'rxjs';


@Component({
  selector: 'app-sources-page',
  templateUrl: './selected-sources.page.html',
  styleUrls: ['./selected-sources.page.scss'],
})
export class SelectedSourcesPage implements OnInit {

  selected_sources: PostCreatePayment.Request[] = [];
  source_amount = "0"

  constructor(private loading: LoadingService, private router: Router, public rx: RX,private walletSrv:WalletService) { }

  ngOnInit() {
    this.selected_sources = this.rx.temp["transaction"]["payments"].value;
    this.rx.temp.transaction.payments.subscribe(d=>{
      this.selected_sources = d;
      // calculate source total
      this.source_amount = this.rx.temp["transaction"].source_amount = this.selected_sources.map(s=>s.amount).reduce((a, b) => a + b, 0)
      +"" || 0+"";
    })
  }
  continue_to_destination() {
    // this.rx.save_temp();
    this.router.navigateByUrl("transaction/destinations-sequence/selected-destinations");
  }

  continue_to_overview() {
    // this.rx.save_temp();
    this.rx.temp.view_transaction.next(this.walletSrv.convert_rxtran_to_transaction(this.rx.temp["transaction"]))
    console.log("this.rx.temp.view_transaction");

    this.router.navigateByUrl("/action/complete-transaction")
  }

  add_source() {
    this.router.navigateByUrl("transaction/sources-sequence/available-sources");
  }

  edit_source(source:PostCreatePayment.Request){
    this.router.navigateByUrl("/transaction/sources-sequence/source?payment_method="+encodeURIComponent(source.payment_method.type)+"&category="+encodeURIComponent(source.metadata.category)+"&image="+encodeURIComponent(source.metadata.image)+"&name="+encodeURIComponent(source.metadata.name))
  }

}
