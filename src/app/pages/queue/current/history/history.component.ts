import { Component, OnInit, Input } from '@angular/core';
import { VisitService } from '../../../services/visit.service';
import { Visit } from '../../../../models/visit/Visit';
import { HospitalAdmin } from '../../../../models/user/HospitalAdmin';
import { HospitalService } from '../../../services/hospital.service';
import { Patient } from 'app/models/patient/Patient';
import { QueueService } from 'app/pages/services/queue.service';

@Component({
    selector: 'patient-history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {
    patientvisits: Array<Visit>;
    hospitaladmins: Array<HospitalAdmin>;
    displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];

    constructor(private patientvisitService: VisitService,
        private queue: QueueService,
        private hospitalservice: HospitalService, ) {

        this.queue.currentpatientHistory.subscribe(visits => {
            this.patientvisits = visits;
        });
        this.hospitalservice.hospitaladmins.subscribe(admins => {
            this.hospitaladmins = admins;
        });
    }

    ngOnInit(): void {
    }

}
