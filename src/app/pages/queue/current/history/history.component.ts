import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { VisitService } from '../../../services/visit.service';
import { Visit } from '../../../../models/visit/Visit';
import { HospitalAdmin } from '../../../../models/user/HospitalAdmin';
import { HospitalService } from '../../../services/hospital.service';
import { Patient } from 'app/models/patient/Patient';
import { QueueService } from 'app/pages/services/queue.service';
import { Procedureperformed } from 'app/models/procedure/Procedureperformed';
import * as BSON from 'bson';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
    constructor(private patientvisitService: VisitService,
        private queue: QueueService,
        private hospitalservice: HospitalService, ) {

        this.queue.currentpatientHistory
            .pipe(takeUntil(this.comopnentDestroyed))

            .subscribe(visits => {
                this.patientvisits = visits;
                this.flattenedProcedures = [];
                visits.map(visit => {
                    this.flattenedProcedures.push(...visit.procedures.map(t => {
                        return Object.assign({}, t, { id: visit._id });
                    }));
                });
            });
        this.hospitalservice.hospitaladmins.subscribe(admins => {
            this.hospitaladmins = admins;
        });
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
        this.comopnentDestroyed.next(true);
    }


}
