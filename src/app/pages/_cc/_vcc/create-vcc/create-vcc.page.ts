import { LoadingService } from './../../../../services/loading.service';
import { RX } from 'src/app/services/rx/events.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { VccService } from 'src/app/services/vcc/vcc.service';
import { ICreateVccToUser_Metadata } from 'src/app/interfaces/rapyd/ivcc';

@Component({
  selector: 'app-create-vcc',
  templateUrl: './create-vcc.page.html',
  styleUrls: ['./create-vcc.page.scss'],
})
export class CreateVccPage implements OnInit {

  constructor(private vccSrv:VccService,private router:Router, private rx:RX, public loading:LoadingService) { }

  ngOnInit() {
  }

  view_all_btn(){
  }

  vcc_name = "My Card"
  create_vcard_btn(){
    this.loading.start();
    let metadata:ICreateVccToUser_Metadata={
      name:this.vcc_name
    }
    this.vccSrv.create_vcc_to_user(metadata).subscribe(d=>{
      this.loading.stop();
      this.rx.get_db_contact();
      this.rx.get_db_metacontact();
      if (d.success) {
        this.rx.toast("Credit Card Created 💳")
      }else{
        this.rx.toastError(d as any)
      }
    },err=>{
      this.loading.stop();
      this.rx.toastError(err)
    })
  }

}
