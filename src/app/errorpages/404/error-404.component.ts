import {Component, ViewEncapsulation} from '@angular/core';
import {FuseSplashScreenService} from '../../../@fuse/services/splash-screen.service';
import {HttpClientModule} from '@angular/common/http';

@Component({
    selector: 'error-404',
    templateUrl: './error-404.component.html',
    styleUrls: ['./error-404.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class Error404Component {
    /**
     * Constructor
     */
    constructor(private _fuseSplashScreenService: FuseSplashScreenService, res: HttpClientModule) {

    }

}
