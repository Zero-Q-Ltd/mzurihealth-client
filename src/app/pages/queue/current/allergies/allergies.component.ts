import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup} from 'ngx-strongly-typed-forms';
import {Allegy as Allergy, allergy, allerytypearray} from 'app/models/procedure/Allergy.model';
import {QueueService} from 'app/pages/services/core/queue.service';
import {LocalcommunicationService} from '../localcommunication.service';
import {Meta, Metadata} from 'app/models/universal';
import {AdminService} from 'app/pages/services/admin.service';
import {HospitalService} from 'app/pages/services/hospital.service';
import {ReplaySubject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {CoreService} from 'app/pages/services/core/core.service';

@Component({
    selector: 'app-allergies',
    templateUrl: './allergies.component.html',
    styleUrls: ['./allergies.component.scss']
})
export class AllergiesComponent implements OnInit, OnDestroy {
    tempAllergies: FormArray<Allergy> = new FormArray<Allergy>([]);
    allergyArray = allerytypearray;
    comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

    constructor(private queue: QueueService,
                private formBuilder: FormBuilder,
                private comm: LocalcommunicationService,
                private hospitalservice: HospitalService,
                private core: CoreService,
                private adminservice: AdminService) {
        this.queue.currentpatient
            .pipe(takeUntil(this.comopnentDestroyed))
            .subscribe(value => {
                /**
                 * always initialize the array with a value
                 */
                if (value.medicalInfo.allergies && value.medicalInfo.allergies.length > 0) {
                    this.tempAllergies = this.formBuilder.array<Allergy>(value.medicalInfo.allergies.map(aller => {
                        return this.addellergy(aller.type, aller.detail, aller.metadata);
                    }));
                }

            });
        this.tempAllergies.valueChanges.subscribe(values => {
            /**
             * No validation for now
             */
            console.log(values);
            this.comm.allergies = values;
        });
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        this.comopnentDestroyed.next(true);
    }


    appendnew(): void {
        this.tempAllergies.push(this.addellergy(allergy.Food, ''));
    }

    /**
     *
     * @param type
     * @param detail
     * @param metadata
     */
    addellergy(type: allergy, detail: string, metadata?: Metadata): FormGroup<Allergy> {
        if (!metadata) {
            const m: Meta = {
                adminId: this.core.userdata.id,
                date: new Date(),
                hospitalId: this.core.activehospital.value._id
            };
            metadata = {
                created: m,
                edited: m
            };
        }
        return this.formBuilder.group<Allergy>({
            type,
            detail,
            metadata
        });
    }

    /**
     *
     * @param index
     */
    removeAllergy(index: number): void {

    }
}
