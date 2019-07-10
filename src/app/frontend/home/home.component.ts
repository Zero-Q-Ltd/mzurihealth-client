import {Component, OnInit} from '@angular/core';
import {FuseSplashScreenService} from '@fuse/services/splash-screen.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    constructor(private _fuseSplashScreenService: FuseSplashScreenService) {

    }

    ngOnInit() {
    }
}
