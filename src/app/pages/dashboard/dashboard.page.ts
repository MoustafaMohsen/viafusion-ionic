import { BottomDrawerModalComponent } from 'src/app/components/bottom-drawer-amount/bottom-drawer-amount.component';
import { ModalController } from '@ionic/angular';
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
import { IdentityVerification } from 'src/app/interfaces/rapyd/iwallet';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  constructor(public loading: LoadingService, public router: Router, public rx: RX, private walletSrv: WalletService,private modatCtrl:ModalController) { }
  ionViewWillEnter() {
    this.update_balance();
    this.rx.reset_temp_transactions();
  }

  ngOnInit() {
    this.rx.meta$.subscribe(m => {
      if(m ){
        this.trans = m.transactions?.slice(0, 10)
      }
    });
    this.walletSrv.balance$.subscribe(b=>this.balance=b)
  }

  balance: number;

  user: IDBContact = {} as any;

  trans : ITransaction[] = []

  async update_balance() {
    this.balance = await this.walletSrv.get_wallet_balance()
  }

  ion_refresh(e) {
    console.log(e);
    this.update_balance().then(d => {
      e.target.complete();
    }).catch((error) => {
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
    this.rx.reset_temp_transactions()
    this.rx.temp["transaction"].type = "many2many";
    this.router.navigateByUrl("/transaction/sources-sequence/available-sources");
  }

  charge_wallet() {
    this.rx.reset_temp_transactions()
    this.rx.temp["transaction"].type = "many2w";
    this.router.navigateByUrl("/transaction/sources-sequence/available-sources");
  }

  send_from_wallet() {
    this.rx.reset_temp_transactions()
    this.rx.temp["transaction"].type = "w2many";
    this.router.navigateByUrl("/transaction/destinations-sequence/available-destinations");
  }

  insta_send() {
    this.rx.reset_temp_transactions()
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

  async generate_checkout_page(){
    this.router.navigateByUrl("/payment/generate-qr-code");
  }
  async generate_idv_page(){
    let req:IdentityVerification.Request = {
      contact:this.rx.user$.value.contact,
      ewallet:this.rx.user$.value.ewallet,
      reference_id:this.rx.user$.value.contact_reference_id +"__ignore__" + this.rx.makeid(5)
    }
    this.walletSrv.generate_idv_page(req).subscribe(res=>{
      if(res.success){
        this.rx.temp.idv = res.data;
        console.log(res.data);
        this.rx.toast("Verification page generate");
      }else{
        this.rx.toastError(res as any)
      }
    })
  }

  get is_verified(){
    return this.rx?.user$?.value?.rapyd_contact_data?.verification_status != "not verified"
  }
}
