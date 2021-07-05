import { IAPIServerResponse } from './../../interfaces/rapyd/types.d';
import { IDBContact } from './../../interfaces/db/idbcontact';
import { RX } from 'src/app/services/rx/events.service';
import { WalletService } from './../../services/wallet/wallet.service';
import { Router } from '@angular/router';
import { TPoint, TransactionPoint } from '../../interfaces/interfaces';
import { TDirection as _TDirection, Transaction, TStatus as _TStatus } from 'src/app/interfaces/interfaces';
import { Component, OnInit } from '@angular/core';
import { LoadingService } from 'src/app/services/loading.service';
import { IUtilitiesResponse } from 'src/app/interfaces/rapyd/rest-response';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  past_transactions: Transaction[] = [];
  TDirection = _TDirection;
  TStatus = _TStatus;
  constructor(public loading: LoadingService, public router: Router, private rx: RX,private walletSrv:WalletService) { }

  ngOnInit() {
    let points: TransactionPoint[] = [{
      name: "Bank of America",
      type: TPoint.bank,
      status: this.TStatus.success
    },
    {
      name: "Wallet",
      type: TPoint.wallet,
      status: this.TStatus.pending
    },
    {
      name: "Virtural Card",
      type: TPoint.vcard,
      status: this.TStatus.pending
    },
    {
      name: "Physical Card",
      type: TPoint.pcard,
      status: this.TStatus.pending
    }
    ]
    this.past_transactions = [
      {
        name: "",
        description: "Details about Transaction status",
        points: points,
        start_date: new Date(),
        direction: this.TDirection.up,
        amount: 1000,
        status: this.TStatus.pending
      },
      {
        name: "",
        description: "Details about Transaction status",
        points: points,
        start_date: new Date(),
        direction: this.TDirection.down,
        amount: 1000,
        status: this.TStatus.success
      },
      {
        name: "",
        description: "Details about Transaction status",
        points: [points[1], points[2]],
        start_date: new Date(),
        direction: this.TDirection.up,
        amount: 1000,
        status: this.TStatus.failed
      },
    ]

    // if no ballance then update accounts
    this.rx.user$.subscribe(
      u => {
        this.user = u;

      }
    )
  }



  balance:number;

  user: IDBContact = {} as any;


  update_balance(){
    this.balance = this.walletSrv.reduce_accounts_to_amount(this.user.rapyd_wallet_data.accounts,"USD")
  }

  update_accountts() {
    return this.rx.get_db_contact()
  }

  ion_refresh(e){
    console.log(e);

    this.update_accountts().then(d=>{
      e.target.complete();
      this.rx.toast("Refreshed")
    }).catch((error:IAPIServerResponse)=>{
      this.rx.toast(error.message)
    });
    setTimeout(() => {
      console.log('Async operation has ended');
      e.target.complete();
    }, 10000);

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

  send_btn() {
    this.router.navigateByUrl("/transaction/sources-sequence/selected-sources");
  }

  view_all_btn() {
    this.router.navigateByUrl("/transaction/transaction-history");
  }
  onClick() {

  }
}
