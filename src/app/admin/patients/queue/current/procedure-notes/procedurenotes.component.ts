import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ProcedureNotes} from '../../../../../models/procedure/Procedureperformed';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {AdminService} from '../../../../services/admin.service';
import {PatientVisit} from '../../../../../models/visit/PatientVisit';
import {PatientvisitService} from '../../../../services/patientvisit.service';

@Component({
    selector: 'app-procedurenotes',
    templateUrl: './procedurenotes.component.html',
    styleUrls: ['./procedurenotes.component.scss']
})
export class ProcedurenotesComponent implements OnInit {
    procedurenores: Array<ProcedureNotes>;
    newnoteform: FormGroup;
    patientvisit: PatientVisit;

    constructor(
        private adminservice: AdminService,
        private patientvisitservice: PatientvisitService,
        @Inject(MAT_DIALOG_DATA) private procedureid: number,
        private dialogRef: MatDialogRef<ProcedurenotesComponent>
    ) {
        this.patientvisitservice.currentvisit.subscribe(value => {

            if (this.patientvisit) {
                /**
                 * @TODO Make sure the number of notes has not changed so that the ref ID still points to the right procedure
                 */
                if (this.patientvisit.procedures[this.procedureid].notes.length !== value.procedures[this.procedureid].notes.length) {

                }
            } else {
                this.patientvisit = value;
                if (value.procedures[this.procedureid] && typeof value.procedures[this.procedureid].notes === 'string') {

                    this.procedurenores[0] = {
                        /**
                         * Some notes had already been saved in the database with the wrong format, so I had to make this hack
                         */
                        // @ts-ignore
                        note: value.procedures[this.procedureid].notes,
                        admin: {
                            name: 'unknown',
                            id: null
                        }
                    };
                } else {
                    this.procedurenores = value.procedures[this.procedureid] ? value.procedures[this.procedureid].notes : [];
                }

            }
        });
        this.initformm();
    }

    ngOnInit(): void {
    }

    initformm(): void {
        const note = new FormControl('', [Validators.required, Validators.maxLength(600), Validators.minLength(10)]);
        this.newnoteform = new FormGroup({
            note: note
        });
    }

    addnote(): void {
        if (this.newnoteform.valid) {
            this.procedurenores.push(Object.assign({
                admin: {
                    id: this.adminservice.userdata._id,
                    name: this.adminservice.userdata.data.displayName
                },
                note: ''
            }, this.newnoteform.getRawValue()));
            this.dialogRef.close(this.procedurenores);
        }
    }
}
