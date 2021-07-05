import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ListIssuedVcc } from 'src/app/interfaces/rapyd/ivcc';

@Component({
  selector: 'app-vcc-details',
  templateUrl: './vcc-details.page.html',
  styleUrls: ['./vcc-details.page.scss'],
})
export class VccDetailsPage implements OnInit {

  constructor(private router:Router,private route:ActivatedRoute) { }

  ngOnInit() {
  }
  card_details:ListIssuedVcc.Response;

  segmentChanged(e){
    let tab = e.detail.value;
    this.router.navigate(["cc","vcc","vcc-details","vcc-"+tab])
  }

}
