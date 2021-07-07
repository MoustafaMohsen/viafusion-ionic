import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { IAction } from 'src/app/interfaces/db/iaction';
import { IListPayout, IGetPayoutRequiredFields, ICreatePayout, ISimulateTransaction } from 'src/app/interfaces/rapyd/ipayout';
import { IUtilitiesResponse } from 'src/app/interfaces/rapyd/rest-response';
import { Api } from '../api/api';
import { LoadingService } from '../loading.service';
import { RX } from '../rx/events.service';

@Injectable({
  providedIn: 'root'
})
export class SchedualService {

  constructor(private api: Api, private rx: RX, private router: Router, private loading: LoadingService) {
  }
  async get_db_actions(minimum_action_object: IAction) {
    return this.api.post<IAction[]>("get-actions", minimum_action_object)
  }
  async update_db_action(action: IAction, newaction: IAction) {
    return this.api.post<IAction>("update-action", {action,newaction})
  }
  async create_db_action(action: IAction) {
    return this.api.post<IAction>("create-actions", action)
  }
  async delete_db_action(action: IAction) {
    return this.api.post<any>("delete-actions", action)
  }
}
