import { Component, OnInit, OnDestroy } from '@angular/core';
import { emptynote, Patientnote } from '../../../../models/patient/Patientnote';
import { PatientService } from '../../../services/patient.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PatientnotesService } from '../../../services/patientnotes.service';
import { ReplaySubject } from 'rxjs';

@Component({
    selector: 'patient-notes',
    templateUrl: './general-notes.component.html',
    styleUrls: ['./general-notes.component.scss']
})
export class GeneralNotesComponent implements OnInit, OnDestroy {
    patientnotes: Array<Patientnote> = [];
    newnoteform: FormGroup;
    comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

    constructor(private patientservice: PatientService,
        private patientnotesService: PatientnotesService) {
        this.initformm();
        // patientnotesService.patientnotes.subscribe(notes => {
        //     this.patientnotes = notes;
        // });
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
        this.comopnentDestroyed.next(true);
    }

    initformm(): void {
        const title = new FormControl('', [Validators.required, Validators.maxLength(80), Validators.minLength(10)]);
        const note = new FormControl('', [Validators.required, Validators.maxLength(600), Validators.minLength(20)]);
        this.newnoteform = new FormGroup({
            title: title,
            note: note
        });
    }

    addhelpful(): void {

    }

    addnote(): void {
        if (this.newnoteform.valid) {
            const newnote: Patientnote = Object.assign({}, emptynote, this.newnoteform.getRawValue());
            this.patientnotesService.addnote(newnote);
        }
    }
}
