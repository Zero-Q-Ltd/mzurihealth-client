import { Component, Inject, OnInit, Optional, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { emptyadmin, HospitalAdmin } from '../../../models/user/HospitalAdmin';
import * as moment from 'moment';
import { HospitalService } from '../../services/hospital.service';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-admin-selection',
    templateUrl: './admin-selection.component.html',
    styleUrls: ['./admin-selection.component.scss']
})
export class AdminSelectionComponent implements OnInit, OnDestroy {
    chosenadmin: HospitalAdmin = { ...emptyadmin };
    hospitaladmins: Array<HospitalAdmin> = [];
    comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

    constructor(private hospitalService: HospitalService,
        public dialogRef: MatDialogRef<AdminSelectionComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data?: any) {
        hospitalService.hospitaladmins
            .pipe(takeUntil(this.comopnentDestroyed))
            .subscribe(admins => {
                this.hospitaladmins = admins;
            });
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
        this.comopnentDestroyed.next(true);
    }

    leveltext(level): string {
        level = Number(level);
        switch (level) {
            case 0:
                return 'System Admin';

            case 1:
                return 'Doctor';

            case 2:
                return 'Nurse';

            case 3:
                return 'Receptionist';

        }
    }

    availabilitytext(availability): string {
        availability = Number(availability);
        switch (availability) {
            case 0:
                return 'Away';

            case 1:
                return 'On Break';

            case 2:
                return 'Available';
        }
    }

    gettime(): string {
        return moment().format('LLL');
    }

    chooseadmin(admin): void {
        this.chosenadmin = admin;
    }

    save(): void {
        this.dialogRef.close(this.chooseadmin.toString);
    }
}
