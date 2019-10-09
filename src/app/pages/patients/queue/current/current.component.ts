import {Component, OnInit} from '@angular/core';
import {fuseAnimations} from '../../../../../@fuse/animations';
import {LocalcommunicationService} from './localcommunication.service';
import {PatientService} from '../../../services/patient.service';

@Component({
    selector: 'patient-current',
    templateUrl: './current.component.html',
    styleUrls: ['./current.component.scss'],
    animations: fuseAnimations
})
export class CurrentComponent implements OnInit {
    activepage = 'generaldetails';

    constructor(private communication: LocalcommunicationService, private patientservice: PatientService) {
        communication.onactivechildpagechanged.subscribe(page => {
            this.activepage = page;
        });
    }

    ngOnInit(): void {
    }

}
