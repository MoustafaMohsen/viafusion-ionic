import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RequiredFields } from 'src/app/interfaces/rapyd/ipayment';
import { PaymentService } from 'src/app/services/auth/payment';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-source',
  templateUrl: './source.page.html',
  styleUrls: ['./source.page.scss'],
})
export class SourcePage implements OnInit {

  constructor(private paymentSrv: PaymentService, private loading:LoadingService, private router:Router) { }

  ngOnInit() {
  }

  submit(){

  }

}
