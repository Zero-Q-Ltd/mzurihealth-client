import {Component, OnDestroy, OnInit} from '@angular/core';
import {Visit} from '../../../../models/visit/Visit';
import {HospitalAdmin} from '../../../../models/user/HospitalAdmin';
import {QueueService} from 'app/pages/services/core/queue.service';
import {Procedureperformed} from 'app/models/procedure/Procedureperformed';
import * as BSON from 'bson';
import {ReplaySubject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {CoreService} from 'app/pages/services/core/core.service';

@Component({
    selector: 'patient-history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit, OnDestroy {
    patientvisits: Array<Visit>;
    hospitaladmins: Array<HospitalAdmin>;
    displayedColumns: string[] = ['date', 'doctor', 'procedure', 'results'];
    comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

    flattenedProcedures: Array<Procedureperformed & { id: BSON.ObjectID }> = [];

    constructor(
        private queue: QueueService,
        private core: CoreService,) {

        this.queue.currentpatientHistory
            .pipe(takeUntil(this.comopnentDestroyed))

            .subscribe(visits => {
                this.patientvisits = visits;
                this.flattenedProcedures = [];
                visits.map(visit => {
                    this.flattenedProcedures.push(...visit.procedures.map(t => {
                        return Object.assign({}, t, {id: visit._id});
                    }));
                });
            });
        this.core.hospitaladmins.subscribe(admins => {
            this.hospitaladmins = admins;
        });
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        this.comopnentDestroyed.next(true);
    }


}
