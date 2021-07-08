import { HelperService } from './../../../services/util/helper';
import { Router } from '@angular/router';
import { RX } from 'src/app/services/rx/events.service';
import { Component, Input, OnInit } from '@angular/core';
import { ListIssuedVcc } from 'src/app/interfaces/rapyd/ivcc';

@Component({
  selector: 'app-cc',
  templateUrl: './cc.component.html',
  styleUrls: ['./cc.component.scss'],
})
export class CcComponent implements OnInit {

  @Input() card_details:ListIssuedVcc.Response;
  constructor(private rx:RX,private router:Router,private h:HelperService) { }

  ngOnInit() {}

  show=true;

  copy(text){
    this.h.copy(text)
  }
  go_to_card(){
    this.rx.temp.vcc_details = this.card_details;
    this.router.navigateByUrl("/cc/vcc/vcc-details/vcc-history")
  }
}
