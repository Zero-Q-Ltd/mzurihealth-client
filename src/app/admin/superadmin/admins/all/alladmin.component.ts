import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {MatDialog, MatDialogRef, MatTableDataSource} from '@angular/material';
import {HospitalAdmin} from '../../../../models/user/HospitalAdmin';
import {fuseAnimations} from '../../../../../@fuse/animations';
import {HospitalService} from '../../../services/hospital.service';
import {AdminService} from '../../../services/admin.service';
import {ProceduresService} from '../../../services/procedures.service';
import {LocalcommunicationService} from '../../localcommunication.service';
import {AdminInvite} from '../../../../models/user/AdminInvite';
import {AdminCategory} from '../../../../models/user/AdminCategory';
import {FuseConfirmDialogComponent} from '../../../../../@fuse/components/confirm-dialog/confirm-dialog.component';
import {NotificationService} from '../../../../shared/services/notifications.service';

@Component({
    selector: 'admins-all',
    templateUrl: './alladmin.component.html',
    styleUrls: ['./alladmin.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class AlladminComponent implements OnInit {
    adminheaders = ['image', 'Name', 'Email', 'Phone', 'Address', 'Level', 'Status', 'Action'];
    adminsdatasource = new MatTableDataSource<HospitalAdmin>();
    invitedadminsdatasource = new MatTableDataSource<AdminInvite>();
    selectedadmin: HospitalAdmin;
    userdata: HospitalAdmin;
    admincategories: Array<AdminCategory> = [];
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;

    constructor(private hospitalservice: HospitalService,
                private adminservice: AdminService,
                private procedureservice: ProceduresService,
                private _matDialog: MatDialog,
                private notificationservice: NotificationService,
                private communicationService: LocalcommunicationService) {
        this.hospitalservice.hospitaladmins.subscribe(admins => {
            this.adminsdatasource.data = admins;
        });
        this.hospitalservice.invitedadmins.subscribe(admins => {
            this.invitedadminsdatasource.data = admins;
        });
        this.adminservice.observableuserdata.subscribe(value => {
            this.userdata = value;
        });
        this.adminservice.admincategories.subscribe(categories => {
            this.admincategories = categories;
        });
    }

    ngOnInit(): void {
    }

    categorytext(categoryid: string): string {
        if (this.admincategories.length > 0) {
            if (this.admincategories.find(cat => {
                return cat._id === categoryid;
            })) {
                return this.admincategories.find(cat => {
                    return cat._id === categoryid;
                }).name;
            } else {
                return 'Invalid';
            }
        } else {
            return 'loading...';
        }
    }

    cancelinvite(event, user: AdminInvite): void {
        event.stopPropagation();

        this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });
        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to cancel this invite?';
        this.confirmDialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.adminservice.deleteinvite(user.id).then(() => {
                    this.communicationService.resetall();

                    this.notificationservice.notify({
                        placement: {
                            vertical: 'top',
                            horizontal: 'right'
                        },
                        title: 'Cancelled',
                        alertType: 'error',
                        body: ''
                    });
                });
            }
        });

    }

    disableadmin(event, user: HospitalAdmin): void {
        event.stopPropagation();

        this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });
        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want disable this admin?';
        this.confirmDialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.adminservice.disableadmin(user._id).then(() => {
                    this.communicationService.resetall();

                    this.notificationservice.notify({
                        placement: {
                            vertical: 'top',
                            horizontal: 'right'
                        },
                        title: 'Success',
                        alertType: 'success',
                        body: 'Disabled'
                    });
                });
            }
        });
    }

    enableadmin(event, user: HospitalAdmin): void {
        event.stopPropagation();

        this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });
        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want enable this admin?';
        this.confirmDialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.adminservice.enableadmin(user._id).then(() => {
                    this.communicationService.resetall();

                    this.notificationservice.notify({
                        placement: {
                            vertical: 'top',
                            horizontal: 'right'
                        },
                        title: 'Success',
                        alertType: 'success',
                        body: 'Enabled'
                    });
                });
            }
        });

    }

    ondeselect(): void {
        this.communicationService.resetall();
    }

    /**
     * On select
     *
     * @param selected
     */
    onSelect(selected: HospitalAdmin): void {
        this.selectedadmin = selected;
        this.communicationService.onadminselected.next(selected);
    }
}
