import {Component, OnInit} from '@angular/core';
import {SelectionModel} from '@angular/cdk/collections';
import {MergedProcedureModel} from '../../../../../models/procedure/MergedProcedure.model';
import {MatDialogRef, MatTableDataSource} from '@angular/material';
import {ProceduresService} from '../../../../services/procedures.service';
import {emptyprocedureperformed, Procedureperformed} from '../../../../../models/procedure/Procedureperformed';
import {AdminService} from '../../../../services/admin.service';

@Component({
    selector: 'app-perform-procedure',
    templateUrl: './perform-procedure.component.html',
    styleUrls: ['./perform-procedure.component.scss']
})
export class PerformProcedureComponent implements OnInit {
    displayedColumns: string[] = ['select', 'name', 'results', 'notes'];
    proceduresdataSource = new MatTableDataSource<MergedProcedureModel>([]);
    selection = new SelectionModel<MergedProcedureModel>(true, []);
    procedureResults: Array<Procedureperformed> = [];


    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected(): boolean {
        const numSelected = this.selection.selected.length;
        const numRows = this.proceduresdataSource.data.length;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle(): void {
        this.isAllSelected() ?
            this.selection.clear() :
            this.proceduresdataSource.data.forEach(row => this.selection.select(row));
    }

    /** The label for the checkbox on the passed row */
    checkboxLabel(row?: MergedProcedureModel): string {
        if (!row) {
            return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
        }
        return `${this.selection.isSelected(row) ? 'deselect' : 'select'} `;
    }

    constructor(public dialogRef: MatDialogRef<PerformProcedureComponent>,
                private procedureservice: ProceduresService,
                private adminservice: AdminService,
    ) {
        /**
         *TODO: Here I've had to device a temporary hack that should be fixed
         * Iterate through the procedures and create resulst for all of them, so that the html renders without errors
         */
        procedureservice.hospitalprocedures.subscribe(mergedprocedures => {
            mergedprocedures.forEach((r, i) => {
                this.procedureResults[i] = {...emptyprocedureperformed};
                /**
                 * very useful for later on when dialog is dismissed
                 */
                this.procedureResults[i].originalProcedureId = r.rawProcedure.id;
                this.procedureResults[i].customProcedureId = r.customProcedure.id;
                this.procedureResults[i].notes[0] = {
                    note: '',
                    admin: {
                        id: this.adminservice.userdata._id,
                        name: this.adminservice.userdata.data.displayName
                    }
                };
            });
            this.proceduresdataSource.data = mergedprocedures;

        });
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    doCleanup() {

    }

    ngOnInit(): void {
    }

}
