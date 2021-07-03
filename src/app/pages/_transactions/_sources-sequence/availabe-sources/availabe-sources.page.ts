import { PaymentService } from './../../../../services/auth/payment';
import { Component, OnInit } from '@angular/core';
import { ISource } from 'src/app/interfaces/interfaces';
import { map, startWith } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-availabe-sources',
  templateUrl: './availabe-sources.page.html',
  styleUrls: ['./availabe-sources.page.scss'],
})
export class AvailabeSourcesPage implements OnInit {

  //#region AutoComplete
  stateCtrl = new FormControl();
  filteredStates: Observable<State[]>;

  states: State[] = [
    {
      name: 'Arkansas',
      population: '2.978M',
      // https://commons.wikimedia.org/wiki/File:Flag_of_Arkansas.svg
      flag: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Flag_of_Arkansas.svg'
    },
    {
      name: 'California',
      population: '39.14M',
      // https://commons.wikimedia.org/wiki/File:Flag_of_California.svg
      flag: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Flag_of_California.svg'
    },
    {
      name: 'Florida',
      population: '20.27M',
      // https://commons.wikimedia.org/wiki/File:Flag_of_Florida.svg
      flag: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Florida.svg'
    },
    {
      name: 'Texas',
      population: '27.47M',
      // https://commons.wikimedia.org/wiki/File:Flag_of_Texas.svg
      flag: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Texas.svg'
    }
  ];
  //#endregion
  source_item: ISource = {
    name: "wallet",
    description: "",
    start_date: new Date(),
    amount: 0,
  };


  constructor(private paymentSrv: PaymentService) {
    this.filteredStates = this.stateCtrl.valueChanges
    .pipe(
      startWith(''),
      map((state:any) => state ? this._filterStates(state) : this.states.slice())
    );
  }
  private _filterStates(value: string): State[] {
    const filterValue = value.toLowerCase();

    return this.states.filter(state => state.name.toLowerCase().includes(filterValue));
  }


  ngOnInit() {

  }

  renderPaymenMethods(country: string) {
    this.paymentSrv.list_payment_methods("")
  }

}


export interface State {
  flag: string;
  name: string;
  population: string;
}
