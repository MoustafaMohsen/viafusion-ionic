import { VccService } from './../../../services/vcc/vcc.service';
import { Component, OnInit } from '@angular/core';
import { ICardDetails } from 'src/app/interfaces/interfaces';

@Component({
  selector: 'app-list-of-cc',
  templateUrl: './list-of-cc.page.html',
  styleUrls: ['./list-of-cc.page.scss'],
})
export class ListOfCcPage implements OnInit {

  constructor(private vccSrv:VccService) { }

  ngOnInit() {
  }

  cards:ICardDetails[] = []
  ionViewWillEnter() {
    this.vccSrv.get_vccs().subscribe(res=>{

      console.log("res");
      console.log(res);

      this.cards = Object.values(res.data)
      console.log("this.cards");
      console.log(this.cards);

    })
  }

  create_cc_btn(){

  }
  back(){

  }
}
