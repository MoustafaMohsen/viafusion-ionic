import { Component, OnInit } from '@angular/core';
import { TPoint, TransactionPoint } from '../../../interfaces/interfaces';
import { TDirection as _TDirection, Transaction, TStatus  as _TStatus } from 'src/app/interfaces/interfaces';
import { LoadingService } from 'src/app/services/loading.service';
import { Router } from '@angular/router';
import { ITransaction } from 'src/app/interfaces/db/idbmetacontact';

@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.page.html',
  styleUrls: ['./transaction-history.page.scss'],
})
export class TransactionHistoryPage implements OnInit {

  past_transactions:ITransaction[]=[];
  constructor(public loading:LoadingService, public router:Router) { }

  ngOnInit() {
  }


}
