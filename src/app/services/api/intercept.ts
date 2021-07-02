import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Network } from '@ionic-native/network/ngx';

import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CheckHttp implements HttpInterceptor {

  constructor(
    private net: Network,
  ) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<HttpEventType.Response>> {
    if (req.url.indexOf('http') == -1) {  // local request, e.g., translate
      return next.handle(req);
    }
    /*

    Triggering login check error upon startup due to netWarn not being recognized

    -yonathan

    if (this.net.type != 'wifi' && options.netWarn) {
      this.showMessage('cell');
    }

     */

    if (this.net.type == 'none') {
      // no network, abort request
      this.showMessage('conn');
      return Observable.throw('conn_off');
    }

    return next.handle(req).pipe(catchError(
      (err: HttpErrorResponse) => {
        let code = '', msg = '';
        // https://stackoverflow.com/questions/46019771/catching-errors-in-angular-httpclient
        if (err.error instanceof Error || err.error instanceof ProgressEvent || err.error instanceof ErrorEvent) {
          // A client-side or network error occurred. Handle it accordingly.
          code = 'client';
          msg = `${err.statusText || 'NA'} (${err.status})`;
        } else {
          // The backend returned an unsuccessful response code.
          // The response body may contain clues as to what went wrong,
          code = 'server';
          if (err.error) {
            msg = `${err.error} (${err.status})`;
          } else {
            msg = err.message ? `${err.message} (${err.status || '0'})` : err.toString();
          }
        }
        this.showMessage(code, msg);
        return Observable.throw(code);
      }
    ));
  }

  private showMessage(code: string, msg: string = '') {
    // this.events.publish('api:net', {code: code, msg: msg});
  }

}
