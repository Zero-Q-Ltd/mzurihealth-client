import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatDialogRef, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {RawProcedure, RawProcedureCategory} from '../../../../models/procedure/RawProcedure';
import {ProceduresService} from '../../../services/procedures.service';
import {CustomProcedure, emptycustomprocedure} from '../../../../models/procedure/CustomProcedure';
import {ProcedureCategory} from '../../../../models/procedure/ProcedureCategory';
import {LocalcommunicationService} from '../../localcommunication.service';
import {fuseAnimations} from '../../../../../@fuse/animations';
import {FuseConfirmDialogComponent} from '../../../../../@fuse/components/confirm-dialog/confirm-dialog.component';
import {NotificationService} from '../../../../shared/services/notifications.service';
import {MergedProcedureModel} from '../../../../models/procedure/MergedProcedure.model';

@Component({
    selector: 'procedures-all',
    templateUrl: './all.component.html',
    styleUrls: ['./all.component.scss'],
    animations: [fuseAnimations]
})
export class AllComponent implements OnInit, AfterViewInit {
    hospitalprocedures = new MatTableDataSource<MergedProcedureModel>();
    procedurecategories: Array<ProcedureCategory>;
    procedureheaders = ['name', 'category', 'regprice', 'minprice', 'maxprice', 'action'];
    selectedprocedure: CustomProcedure = {...emptycustomprocedure};
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    disableripple: boolean;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    constructor(private procedureservice: ProceduresService,
                private communicationservice: LocalcommunicationService,
                private _matDialog: MatDialog,
                private notificationservice: NotificationService) {
        procedureservice.hospitalprocedures.subscribe(mergedprocedures => {
            this.hospitalprocedures.data = mergedprocedures;
        });
        procedureservice.procedurecategories.subscribe(categories => {
            this.procedurecategories = categories;
        });
    }

    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
        this.hospitalprocedures.paginator = this.paginator;
        this.hospitalprocedures.sort = this.sort;
    }

    applyFilter(filterValue: string): void {
        this.hospitalprocedures.filter = filterValue.trim().toLowerCase();
    }

    getcategory(category: RawProcedureCategory): string {
        if (category.subCategoryId) {
            return this.procedurecategories.find(cat => {
                return cat.id === category.id;
            }).subcategories[category.subCategoryId].name;
        } else {
            return '';
        }
    }

    disableeprocedure(event, procedure: CustomProcedure): void {
        event.stopPropagation();
        this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });
        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to disable this procedure?';
        this.confirmDialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.procedureservice.disableprocedure(procedure.id).then(() => {
                    this.communicationservice.resetall();

                    this.notificationservice.notify({
                        placement: {
                            vertical: 'top',
                            horizontal: 'right'
                        },
                        title: 'Success',
                        alertType: 'success',
                        body: 'Deleted'
                    });
                });
            }
        });

    }

    /**
     * On select
     *
     * @param selected
     */
    onSelect(selected: { rawprocedure: RawProcedure, customprocedure: CustomProcedure }): void {
        this.selectedprocedure = selected.customprocedure;
        this.communicationservice.onprocedureselected.next({selectiontype: 'customProcedure', selection: selected});
    }

}
