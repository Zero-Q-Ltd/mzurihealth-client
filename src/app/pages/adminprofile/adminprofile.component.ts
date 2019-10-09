import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {fuseAnimations} from '../../../@fuse/animations';

@Component({
    selector: 'app-adminprofile',
    templateUrl: './adminprofile.component.html',
    styleUrls: ['./adminprofile.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class AdminprofileComponent implements OnInit {

    constructor() {
    }

    ngOnInit() {
    }

}
