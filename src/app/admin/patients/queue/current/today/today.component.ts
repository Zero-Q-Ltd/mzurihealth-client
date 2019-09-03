import { Component, OnInit } from '@angular/core';
import { emptyproceduresperformed, ProcedureNotes, Procedureperformed } from '../../../../../models/procedure/Procedureperformed';
import { HospitalAdmin } from '../../../../../models/user/HospitalAdmin';
import { HospitalService } from '../../../../services/hospital.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PatientService } from '../../../../services/patient.service';
import { VisitService } from '../../../../services/visit.service';
import { RawProcedure, RawProcedureCategory } from '../../../../../models/procedure/RawProcedure';
import { CustomProcedure } from '../../../../../models/procedure/CustomProcedure';
import { ProceduresService } from '../../../../services/procedures.service';
import { fuseAnimations } from '../../../../../../@fuse/animations';
import { ProcedureCategory } from '../../../../../models/procedure/ProcedureCategory';
import { BehaviorSubject, Observable } from 'rxjs';
import { MergedProcedureModel } from '../../../../../models/procedure/MergedProcedure.model';
import { map, startWith } from 'rxjs/operators';
import { allerytypearray } from '../../../../../models/procedure/Allergy.model';
import { medicalconditionsarray } from '../../../../../models/procedure/MedicalConditions.model';
import { QueueService } from '../../../../services/queue.service';
import { CurrentPatient } from '../../../../../models/visit/MergedPatientQueueModel';
import { AdminSelectionComponent } from '../../admin-selection/admin-selection.component';
import { MatDialog, MatDialogRef, MatTableDataSource } from '@angular/material';
import { LocalcommunicationService } from '../localcommunication.service';
import { emptypatientvisit, Visit } from '../../../../../models/visit/Visit';
import { NotificationService } from '../../../../../shared/services/notifications.service';
import { PerformProcedureComponent } from '../perform-procedure/perform-procedure.component';
import { SelectionModel } from '@angular/cdk/collections';
import { AdminService } from '../../../../services/admin.service';
import { ProcedurenotesComponent } from '../procedure-notes/procedurenotes.component';
import { FuseConfirmDialogComponent } from '../../../../../../@fuse/components/confirm-dialog/confirm-dialog.component';
import * as moment from 'moment';
import { Meta } from 'app/models/universal';

@Component({
    selector: 'patient-today',
    templateUrl: './today.component.html',
    styleUrls: ['./today.component.scss'],
    animations: [fuseAnimations]

})
export class TodayComponent implements OnInit {
    procedureperformed: FormGroup;
    vitalsform: FormGroup;
    hospitalprocedures: Array<MergedProcedureModel> = [];
    selectedprocedure: { rawprocedure: RawProcedure, customprocedure: CustomProcedure };
    currentpatient: CurrentPatient;
    expand = true;
    procedurecategories: Array<ProcedureCategory>;
    procedureselection: FormGroup;
    allergiesform: FormGroup;
    allergytypes = allerytypearray;
    medconditionsform: FormGroup;
    medconditiontypes = medicalconditionsarray;
    filteredprocedures: Observable<MergedProcedureModel[]>;
    dialogRef: MatDialogRef<any>;
    imeanzilishwa: BehaviorSubject<boolean> = new BehaviorSubject(false);
    hospitaladmins: Array<HospitalAdmin> = [];
    currentvisit: Visit = { ...emptypatientvisit };
    proceduresdatasource: MatTableDataSource<Procedureperformed> = new MatTableDataSource([]);
    procedurecolumns = ['name', 'practitioner', 'results', 'notes', 'action'];
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;

    constructor(private hospitalservice: HospitalService,
        private formBuilder: FormBuilder,
        private patientservice: PatientService,
        private procedureservice: ProceduresService,
        private queue: QueueService,
        public _matDialog: MatDialog,
        private patientvisitservice: VisitService,
        private communication: LocalcommunicationService,
        private adminservice: AdminService,
        private notifications: NotificationService) {

        procedureservice.procedurecategories.subscribe(categories => {
            this.procedurecategories = categories;
        });
        hospitalservice.hospitaladmins.subscribe(admins => {
            this.hospitaladmins = admins;
        });

        procedureservice.hospitalprocedures.subscribe(mergedprocedures => {
            this.hospitalprocedures = mergedprocedures;
        });
        queue.currentpatient.subscribe(value => {
            this.currentpatient = value;
            this.anzisha();
            this.imeanzilishwa.next(true);
        });
        patientvisitservice.currentvisit.subscribe(visit => {
            console.log(visit);
            this.currentvisit = visit;
            this.proceduresdatasource.data = visit.procedures;
        });
        this.filteredprocedures = this.procedureselection.valueChanges
            .pipe(
                startWith(''),
                map(value => this._filter(value))
            );
    }

    anzisha(): void {
        this.initprocedureform();
        this.initvitalsformm();
        this.initconditionsallergiesforms();
    }

    /**
     * returns the admin object from the list of hospital admins
     * @param adminid
     */
    getadmin(adminid: string): HospitalAdmin {
        return this.hospitalservice.hospitaladmins.value.find(admin => {
            return admin._id === adminid;
        });
    }

    performprocedures(): void {
        const dialogRef = this._matDialog.open(PerformProcedureComponent, {
            width: '80%',
            data: 'Attach'
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                /***
                 * Haaaaack
                 * I hate this
                 */
                console.log(result);
                const selection: SelectionModel<MergedProcedureModel> = result.selection;
                const res: Array<Procedureperformed> = result.res;


                const mappedData: Array<Procedureperformed> = selection.selected.map(value => {
                    const ff = res.filter(value1 => {
                        return value1.originalProcedureId === value.rawProcedure._id;
                    })[0];
                    ff.results = ff.results || '';
                    ff.name = value.rawProcedure.name;
                    ff.category = value.rawProcedure.category;
                    const meta: Meta = {
                        date: moment().toDate(),
                        adminId: this.adminservice.userdata._id,
                        hospitalId: this.hospitalservice.activehospital.value._id
                    };
                    ff.metadata = {
                        created: meta,
                        edited: meta,
                    };
                    ff.adminid = this.patientvisitservice.adminid;
                    ff.payment = {
                        amount: 0,
                        hasInsurance: false,
                        methods: []
                    };
                    ff.originalProcedureId = value.rawProcedure._id;
                    ff.customProcedureId = value.customProcedure._id;
                    if (ff.tempnote && ff.tempnote !== '') {
                        ff.notes[0] = {
                            admin: {
                                _id: this.adminservice.userdata._id,
                                name: this.adminservice.userdata.data.displayName
                            },
                            note: ff.tempnote
                        };
                    } else {
                        ff.notes = [];
                    }

                    delete ff.tempnote;
                    return ff;
                });
                console.log(mappedData);
                this.patientvisitservice.addprocedures(this.currentvisit._id, mappedData);
            }
        });
    }

    deleteprocedure(event, index: number): void {
        event.stopPropagation();

        this.currentvisit.procedures.splice(index, 1);
        this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete this procedure?';
        this.confirmDialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.patientvisitservice.updateprocedures(this.currentvisit._id, this.currentvisit.procedures);
            }
        });
    }

    viewnotes(index: number): void {
        console.log(index);
        const dialogRef = this._matDialog.open(ProcedurenotesComponent, {
            width: '80%',
            data: index
        });
        dialogRef.afterClosed().subscribe((result: Array<ProcedureNotes>) => {
            if (result) {
                this.currentvisit.procedures[index].notes = result;
                this.patientvisitservice.updateprocedures(this.currentvisit._id, this.currentvisit.procedures);
            }
        });

    }

    /**
     * initializes forms and from controls
     */
    initprocedureform(): void {
        const results = new FormControl('', [Validators.required]);
        const notes = new FormControl('', [Validators.required]);
        this.procedureperformed = new FormGroup({
            results: results,
            notes: notes
        });
        const selection = new FormControl('');

        this.procedureselection = new FormGroup({
            selection: selection,
        });
    }

    /**
     * mzio ni allergy. Iga ni copy
     * Food for thought
     * @param mzio
     */
    igamizio(mzio): FormGroup {
        const allergy = new FormControl({
            value: mzio.type,
            disabled: false
        });

        const detail = new FormControl({
            value: mzio.detail,
            disabled: false
        });

        return this.formBuilder.group({
            type: allergy,
            detail: detail
        });
    }

    /**
     * iga ni copy, matatizo ni condition (I think?)
     * @param tatizo
     */
    igamatatizo(tatizo): FormGroup {
        const allergy = new FormControl({
            value: tatizo.type,
            disabled: false
        });

        const detail = new FormControl({
            value: tatizo.detail,
            disabled: false
        });

        return this.formBuilder.group({
            type: allergy,
            detail: detail
        });
    }

    createallergies(): FormGroup {
        const allergy = new FormControl('');

        const detail = new FormControl({
            value: '',
            disabled: true
        });

        return this.formBuilder.group({
            type: allergy,
            detail: detail
        });
    }

    createmedconditions(): FormGroup {
        const condition = new FormControl('');

        const detail = new FormControl({
            value: '',
            disabled: true
        });

        return this.formBuilder.group({
            type: condition,
            detail: detail
        });
    }

    updateVitalsAllegiesConditions(): void {
        this.patientservice.updateVitalsAllegiesConditions(this.currentpatient.patientdata._id,
            this.vitalsform.getRawValue(),
            this.medconditionsform.getRawValue().conditionsformArray,
            this.allergiesform.getRawValue().allergiesformArray).then(() => {
                this.notifications.notify({
                    placement: {
                        vertical: 'top',
                        horizontal: 'right'
                    },
                    title: 'Success',
                    alertType: 'success',
                    body: 'Saved'
                });
            });
    }

    onSelect(selected: { rawprocedure: RawProcedure, customprocedure: CustomProcedure }): void {
        this.selectedprocedure = selected;
    }

    getcategory(category: RawProcedureCategory): string {
        if (category && category.subCategoryId) {
            return this.procedurecategories.find(cat => {
                return cat._id === category._id;
            }).subcategories[category.subCategoryId].name;
        } else {
            return '';
        }
    }

    showadminchoice(): void {

        this.dialogRef = this._matDialog.open(AdminSelectionComponent, {});

        this.dialogRef.afterClosed().subscribe((res: HospitalAdmin) => {
            console.log(res);
            if (res) {
                console.log(res);
                // this.queue.assignadmin(this.currentpatient.queuedata, res._id).then(() => {
                //     /**
                //      * important to change from the currently active tab as it will become inactive
                //      */
                //     this.communication.ontabchanged.next(1);
                // });
            }
        });
    }

    exitpatientandacceptnext(): void {
        /**
         * first check if there's a next patient
         */
        if (this.queue.mypatientqueue.value[1]) {
            this.queue.acceptpatient(this.queue.mypatientqueue.value[1].queuedata);
        } else {

        }
        // this.patientvisitservice.awaitpayment(this.currentpatient.queuedata._id).then(() => {
        //     /**
        //      * important to change from the currently active tab as it will become inactive
        //      */
        //     this.communication.ontabchanged.next(1);
        // });
    }

    exitpatientandbreak(): void {

    }

    addallergy(): void {
        // @ts-ignore
        this.allergiesform.get('allergiesformArray').push(this.createallergies());

        this.allergychanges();
    }

    deleteallergy(index: number): void {
        // @ts-ignore
        this.allergiesform.get('allergiesformArray').removeAt(index);
        this.allergychanges();
    }

    allergychanges(): void {
        // @ts-ignore
        this.allergiesform.get('allergiesformArray').controls.forEach(x => {
            x.get('type').valueChanges.subscribe(g => {
                if (g) {
                    if (x.get('type').value.toString().length > -1) {
                        x.get('detail').enable({ emitEvent: false });
                    } else {
                        x.get('detail').disable({ emitEvent: false });
                    }
                }
            });
        });
    }

    addcondition(): void {
        // @ts-ignore
        this.medconditionsform.get('conditionsformArray').push(this.createmedconditions());

        this.conditionschanges();
    }

    deletecondition(index: number): void {
        // @ts-ignore
        this.medconditionsform.get('conditionsformArray').removeAt(index);
        this.conditionschanges();

    }

    conditionschanges(): void {
        // @ts-ignore
        this.medconditionsform.get('conditionsformArray').controls.forEach(x => {
            x.get('type').valueChanges.subscribe(g => {
                if (g) {
                    if (x.get('type').value.toString().length > -1) {
                        x.get('detail').enable({ emitEvent: false });
                    } else {
                        x.get('detail').disable({ emitEvent: false });
                    }
                }
            });
        });
    }

    initvitalsformm(): void {
        const height = new FormControl(this.currentpatient.medicalInfo.vitals.height);
        const weight = new FormControl(this.currentpatient.medicalInfo.vitals.weight);
        const pressure = new FormControl(this.currentpatient.medicalInfo.vitals.pressure);
        const heartrate = new FormControl(this.currentpatient.medicalInfo.vitals.heartRate);
        const sugar = new FormControl(this.currentpatient.medicalInfo.vitals.sugar);
        const respiration = new FormControl(this.currentpatient.medicalInfo.vitals.respiration);
        this.vitalsform = new FormGroup({
            height: height,
            weight: weight,
            pressure: pressure,
            heartrate: heartrate,
            sugar: sugar,
            respiration: respiration,
        });
    }

    procedureselectiondisplayfn(data?: MergedProcedureModel): string {
        return data ? data.rawProcedure.name : '';
    }

    saveprescription(): void {
        this.patientvisitservice.setprescription(this.currentvisit._id, this.currentvisit.prescription).then(() => {
            this.notifications.notify({
                placement: {
                    vertical: 'top',
                    horizontal: 'right'
                },
                title: 'Success',
                alertType: 'success',
                body: 'Saved'
            });
        });
    }

    addprocedure(): void {
        // return console.log(this.procedureselection.getRawValue());
        if (this.procedureperformed.valid) {
            this.expand = false;
            const procedure: Procedureperformed = Object.assign({}, { ...emptyproceduresperformed }, this.procedureperformed.getRawValue());
            const originaldata: MergedProcedureModel = this.procedureselection.getRawValue().selection;
            this.patientvisitservice.addprocedure(this.currentvisit._id, originaldata, procedure).then(() => {
                this.notifications.notify({
                    placement: {
                        vertical: 'top',
                        horizontal: 'right'
                    },
                    title: 'Success',
                    alertType: 'success',
                    body: 'Saved'
                });
            });

        }
    }

    ngOnInit(): void {
    }

    private initconditionsallergiesforms(): void {
        this.allergiesform = this.formBuilder.group({
            allergiesformArray: this.formBuilder.array(this.currentpatient.medicalInfo.allergies.map(mzio => {
                return this.igamizio(mzio);
            }))
        });
        this.medconditionsform = this.formBuilder.group({
            conditionsformArray: this.formBuilder.array(this.currentpatient.medicalInfo.conditions.map(tatizo => {
                return this.igamatatizo(tatizo);
            }))
        });
        /**
         * neccessary the first time the form is created to allow enabling
         */
        this.allergychanges();
        this.conditionschanges();
    }

    private _filter(value: { selection: MergedProcedureModel | string }): MergedProcedureModel[] {
        if (!value || typeof value.selection !== 'string') {
            return this.hospitalprocedures;
        }
        const filterValue = value.selection.toLowerCase();
        return this.hospitalprocedures.filter(option => option.rawProcedure.name.toLowerCase().includes(filterValue));
    }

}
