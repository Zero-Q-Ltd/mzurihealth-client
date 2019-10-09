import {Component, OnInit} from '@angular/core';
import {VisitService} from '../../../../services/visit.service';
import {Visit} from '../../../../../models/visit/Visit';
import {HospitalAdmin} from '../../../../../models/user/HospitalAdmin';
import {HospitalService} from '../../../../services/hospital.service';

@Component({
    selector: 'patient-history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {
    patientvisits: Array<Visit>;
    hospitaladmins: Array<HospitalAdmin>;

    constructor(private patientvisitService: VisitService,
                private  hospitalservice: HospitalService,) {
        patientvisitService.visithistory.subscribe(visits => {
            this.patientvisits = visits;
        });
        hospitalservice.hospitaladmins.subscribe(admins => {
            this.hospitaladmins = admins;
        });
    }

    ngOnInit(): void {
    }

}
