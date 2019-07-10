import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LocalcommunicationService {
    ontabchanged = new BehaviorSubject<number>(0);
    onactivechildpagechanged = new BehaviorSubject<string>('generaldetails');

    constructor() {

    }

    resetall(): void {
        // this.onprocedureselected.next({selectiontype: null, selection: null});
    }
}
