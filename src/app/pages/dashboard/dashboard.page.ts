import { ITransaction } from 'src/app/interfaces/db/idbmetacontact';
import { Subject, Subscription } from 'rxjs';
import { IAPIServerResponse } from './../../interfaces/rapyd/types.d';
import { IDBContact } from './../../interfaces/db/idbcontact';
import { RX } from 'src/app/services/rx/events.service';
import { WalletService } from './../../services/wallet/wallet.service';
import { Router } from '@angular/router';
import { TPoint, TransactionPoint } from '../../interfaces/interfaces';
import { TDirection as _TDirection, Transaction, TStatus as _TStatus } from 'src/app/interfaces/interfaces';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { LoadingService } from 'src/app/services/loading.service';
import { IUtilitiesResponse } from 'src/app/interfaces/rapyd/rest-response';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit, AfterViewInit {

  constructor(public loading: LoadingService, public router: Router, private rx: RX,private walletSrv:WalletService) { }
  ngAfterViewInit(): void {
    this.update_balance();
  }

  ngOnInit() {
    this.rx.meta$.subscribe(m=>{
      m&&this.trans$.next(m.transactions)
    })
  }

  balance:number;

  user: IDBContact = {} as any;

  trans$=new Subject<ITransaction[]>()

  async update_balance(){
    this.balance = await this.walletSrv.get_wallet_balance()
  }

  ion_refresh(e){
    console.log(e);
    this.update_balance().then(d=>{
      e.target.complete();
    }).catch((error)=>{
      console.error(error);
      this.rx.toastError(error)
    });
  }


  // =========== Button Click events
  add_btn() {
    this.router.navigateByUrl("cc/vcc/create-vcc");
  }

  nfc_btn() {
    this.router.navigateByUrl("payment/nfc-payment");
  }

  move_btn() {
    // TODO create internal transaction page
    this.router.navigateByUrl("/transaction/internal-transaction");
  }

  make_transaction() {
    this.router.navigateByUrl("/transaction/sources-sequence/selected-sources");
  }

  insta_send(){
    this.router.navigateByUrl("/insta-send/enter-amount");
  }

  view_all_btn() {
    this.router.navigateByUrl("/transaction/transaction-history");
  }

  store() {
    this.router.navigateByUrl("/marketplace/shop");
  }

  sell() {
    this.router.navigateByUrl("/marketplace/sell");
  }
  seeAll() {
    this.router.navigateByUrl("/cc/list-of-cc");
  }

  create() {
    this.router.navigateByUrl("/cc/vcc/create-vcc");
  }
  onClick() {

  }
}
