import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CoreService } from '../services/core/core.service';
import { StitchService } from '../services/stitch/stitch.service';

@Injectable()
export class UsersGuard implements CanActivate {
    constructor(private core: CoreService, private router: Router,
        private stitch: StitchService) {

    }

    canActivate(active: ActivatedRouteSnapshot, activated: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        if (this.stitch.auth.isLoggedIn) {
            console.log('logged in');
            return this.core.observableuserdata
                .pipe(map(userdata => {
                    console.log(userdata);
                    if (userdata) {
                        return true;
                    } else {
                        this.router.navigate(['authentication/signin']);
                        return false;
                    }
                }));
        } else {
            this.router.navigate(['authentication/signin']);
            console.log('logged out');
            return false;
        }

        return true;

    }
}
