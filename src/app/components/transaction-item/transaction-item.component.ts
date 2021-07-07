import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { RX } from 'src/app/services/rx/events.service';
import { Component, Input, OnInit } from '@angular/core';
import { ITransaction } from 'src/app/interfaces/db/idbmetacontact';
import { TDirection as _TDirection, Transaction, TStatus  as _TStatus, TPoint  as _TPoint, TransactionPoint } from 'src/app/interfaces/interfaces';

@Component({
  selector: 'app-transaction-item',
  templateUrl: './transaction-item.component.html',
  styleUrls: ['./transaction-item.component.scss'],
})
export class TransactionItemComponent implements OnInit {

  @Input() transaction:ITransaction;
  constructor(private router:Router,private rx:RX, private alertCtr:AlertController) { }

  ngOnInit() {}

  dash_class(p_length:number,i:number){
    let key = "points_count_"+p_length
    return {
      [key]:true
    }
  }

  go_to_transaction(){
    console.log("Go To Transaction");
    console.log(this.transaction);


    switch (this.transaction.type) {
      case "w2w":
        this.alertCtr.create({
          header:`Sent ${this.transaction.source_amount}$`,
          subHeader:new Date(this.transaction.execution_date * 1000).toLocaleString(),
          message:this.transaction.description,
          buttons:['Okay']
        }).then(m=>m.present())
        break;
      case "w2recived":
        this.alertCtr.create({
          header:`Recived ${this.transaction.source_amount}$`,
          subHeader:new Date(this.transaction.execution_date * 1000).toLocaleString(),
          message:this.transaction.description,
          buttons:[{
            text:"Okay",
            role:"cancel",
            handler:()=>{

            }
          },{
            text:"Say Thanks",
            role:"thanks",
            handler:()=>{
              console.log("Said Thanks")
              // TODO: Send message
            }
          }]
        }).then(m=>m.present())

        break;

      default:
        this.rx.temp.view_transaction.next(this.transaction);
        this.router.navigateByUrl("/action/complete-transaction")
        break;
    }
  }
}
