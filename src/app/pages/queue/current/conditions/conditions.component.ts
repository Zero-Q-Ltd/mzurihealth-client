import {Component, OnDestroy, OnInit} from '@angular/core';
import {ReplaySubject} from 'rxjs';

@Component({
    selector: 'app-conditions',
    templateUrl: './conditions.component.html',
    styleUrls: ['./conditions.component.scss']
})
export class ConditionsComponent implements OnInit, OnDestroy {
    comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

    constructor() {
    }

    ngOnInit() {
    }

    ngOnDestroy(): void {
        this.comopnentDestroyed.next(true);
    }

}
