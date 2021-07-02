
import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit {

  @Input() number: string;
  @Input() amount: number;
  @Input() message: string;

  constructor(
    private modalCtr: ModalController,
  ) { }
  
  async close() {
    const closeModal: string = "Modal Closed";
    await this.modalCtr.dismiss(closeModal);
  }
  transfer(){

  }
  ngOnInit() { }

}




