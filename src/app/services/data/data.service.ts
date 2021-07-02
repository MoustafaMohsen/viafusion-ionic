import { BehaviorSubject, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { filter, share } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }
  states={};
  states$:{
    [key: string]: BehaviorSubject<any>
  } = {};

  set(id="",data=null){
    id = this.cleanid(id)
    this.states[id]=data;
    if (this.states$[id]===undefined) {
      this.states$[id] = new BehaviorSubject<any>(null);
    }
    this.states$[id].next(data);
  }
  get(id){
    id = this.cleanid(id)
    return this.states[id];
  }

  listen$(id=""){
    id = this.cleanid(id)
    if (this.states$[id]===undefined) {
      this.states$[id] = new BehaviorSubject <any>(null);
    }
    return this.states$[id].pipe(
      filter(d => d !== null),
      share()
    );
  }

  cleanid(id){
    id = id.replace("/","_");
    id = id.toLowerCase();
    return id;
  }
}
