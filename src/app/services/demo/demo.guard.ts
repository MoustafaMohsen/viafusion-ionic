import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { environment } from 'src/environments/environment';
import { RX } from '../rx/events.service';
import { DemoApi } from './demo-api.service';
import { is_demo_public, is_demo_unavailable } from './demo-routes';

/**
 * Demo mode only: keeps logged-out visitors on the public pages and keeps everyone off the screens the demo does not
 * simulate. Outside demo mode it lets everything through, as the app always did.
 */
@Injectable({
  providedIn: 'root'
})
export class DemoGuard implements CanActivate, CanActivateChild {

  constructor(private router: Router, private rx: RX, private demo: DemoApi) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.check(state.url);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.check(state.url);
  }

  private async check(url: string): Promise<boolean | UrlTree> {
    if (!environment.demo) {
      return true;
    }
    // the stored user and history must be back in memory before a page that needs them opens
    await this.rx.restored;
    let logged_in = this.demo.is_authenticated();
    if (is_demo_unavailable(url)) {
      this.rx.toast("That screen is not available in this demo.", "", 3500);
      return this.router.parseUrl(logged_in ? "/dashboard" : "/auth/login");
    }
    if (is_demo_public(url) || logged_in) {
      return true;
    }
    return this.router.parseUrl("/auth/login");
  }
}
