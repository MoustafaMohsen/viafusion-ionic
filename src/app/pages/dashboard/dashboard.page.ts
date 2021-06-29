import { Router } from '@angular/router';
import { TPoint, TransactionPoint } from './../../services/static/interfaces';
import { TDirection as _TDirection, Transaction, TStatus  as _TStatus } from 'src/app/services/static/interfaces';
import { Component, OnInit } from '@angular/core';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  past_transactions:Transaction[]=[];
  TDirection = _TDirection;
  TStatus = _TStatus;
  constructor(public loading:LoadingService, public router:Router) { }

  ngOnInit() {
    let points:TransactionPoint[]=[{
      name:"Bank of America",
      type:TPoint.bank,
      status:this.TStatus.success
    },
    {
      name:"Wallet",
      type:TPoint.wallet,
      status:this.TStatus.pending
    },
    {
      name:"Virtural Card",
      type:TPoint.vcard,
      status:this.TStatus.pending
    },
    {
      name:"Physical Card",
      type:TPoint.pcard,
      status:this.TStatus.pending
    }
  ]
    this.past_transactions=[
      {
        name:"",
        description:"Details about Transaction status",
        points:points,
        start_date:new Date(),
        direction:this.TDirection.up,
        amount:1000,
        status:this.TStatus.pending
      },
      {
        name:"",
        description:"Details about Transaction status",
        points:points,
        start_date:new Date(),
        direction:this.TDirection.down,
        amount:1000,
        status:this.TStatus.success
      },
      {
        name:"",
        description:"Details about Transaction status",
        points:[points[1], points[2]],
        start_date:new Date(),
        direction:this.TDirection.up,
        amount:1000,
        status:this.TStatus.failed
      },
    ]
  }



  add_btn(){
    this.router.navigateByUrl("cc/vcc/create-vcc");
  }

  nfc_btn(){
    this.router.navigateByUrl("payment/nfc-payment");
  }

  move_btn(){
    // TODO create internal transaction page 
    this.router.navigateByUrl("internal-transaction");
  }

  send_btn(){
    this.router.navigateByUrl("transaction/sources/list-sources");
  }

  view_all_btn(){
    this.router.navigateByUrl("transaction/transaction-history");
  }
}
