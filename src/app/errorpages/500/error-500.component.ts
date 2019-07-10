import {Component, ViewEncapsulation} from '@angular/core';
import {FuseSplashScreenService} from '../../../@fuse/services/splash-screen.service';

@Component({
    selector: 'error-500',
    templateUrl: './error-500.component.html',
    styleUrls: ['./error-500.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class Error500Component {
    /**
     * Constructor
     */
    constructor(private _fuseSplashScreenService: FuseSplashScreenService) {

    }
}
