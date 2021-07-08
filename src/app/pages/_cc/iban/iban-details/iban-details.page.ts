import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ListIssuedVcc } from 'src/app/interfaces/rapyd/ivcc';

@Component({
  selector: 'app-iban-details',
  templateUrl: './iban-details.page.html',
  styleUrls: ['./iban-details.page.scss'],
})
export class IbanDetailsPage implements OnInit {

  constructor(private router:Router,private route:ActivatedRoute) { }

  ngOnInit() {
  }
  card_details:ListIssuedVcc.Response;

  segmentChanged(e){
    let tab = e.detail.value;
    this.router.navigate(["cc","iban","iban-details","iban-"+tab])
  }

}
