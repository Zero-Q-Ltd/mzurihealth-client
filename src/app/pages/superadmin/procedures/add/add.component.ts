import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { fuseAnimations } from '../../../../../@fuse/animations';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProceduresService } from '../../../services/procedures.service';
import { ProcedureCategory } from '../../../../models/procedure/ProcedureCategory';
import { emptyprawrocedure, RawProcedure, RawProcedureCategory } from '../../../../models/procedure/RawProcedure';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { FuseSidebarService } from '../../../../../@fuse/components/sidebar/sidebar.service';
import { LocalcommunicationService } from '../../localcommunication.service';
import { NotificationService } from '../../../../shared/services/notifications.service';
import { emptycustomprocedure } from '../../../../models/procedure/CustomProcedure';
import { Paymentmethods } from '../../../../models/payment/PaymentChannel';
import { CoreService } from 'app/pages/services/core/core.service';

@Component({
    selector: 'procedure-add',
    templateUrl: './add.component.html',
    styleUrls: ['./add.component.scss'],
    animations: [fuseAnimations]
})
export class AddComponent implements OnInit, AfterViewInit {
    proceduresform: FormGroup;
    categories: Array<ProcedureCategory> = [];
    loadingprocedures = false;
    insuranceprices: {
        [key: string]: number
    };
    expandedlist = 0;
    selectedprocedure: RawProcedure = { ...emptyprawrocedure };
    procedureheaders = ['name', 'category', 'minprice', 'maxprice'];
    categoryprocedures = new MatTableDataSource<RawProcedure>();
    defaultLimit = 10;
    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort: MatSort;

    constructor(private _formBuilder: FormBuilder,
        private _fuseSidebarService: FuseSidebarService,
        private procedureservice: ProceduresService,
        private communicatioservice: LocalcommunicationService,
        private core: CoreService,
        private notificationservice: NotificationService) {
        this.core.categories.subscribe(categories => {
            this.categories = categories;
        });
    }

    ngOnInit() {
        this.proceduresform = this._formBuilder.group({
            category: ['', Validators.required],
        });
        this.proceduresform.get('category').valueChanges.subscribe((category: ProcedureCategory) => {
            this.loadingprocedures = true;
            this.categoryprocedures.data = [];
            this.procedureservice.fetchproceduresincategory(category._id).then(rawprocedures => {
                this.loadingprocedures = false;
                this.categoryprocedures.data = rawprocedures;
            });
        });
    }

    applyFilter(filterValue: string): void {
        this.categoryprocedures.filter = filterValue.trim().toLowerCase();
    }

    ngAfterViewInit(): void {
        this.categoryprocedures.paginator = this.paginator;
        this.categoryprocedures.sort = this.sort;
    }

    getcategory(category: RawProcedureCategory): any {
        if (category.subCategoryId) {
            return this.categories.find(cat => {
                return cat._id === category._id;
            }).subcategories[category.subCategoryId].name;
        } else {
            return '';
        }
    }

    /**
     * On select
     *
     * @param selected
     */
    onSelect(selected: RawProcedure): void {
        if (this.core.hospitalprocedures.value.get(selected._id.toHexString())) {
            this.notificationservice.notify({
                placement: {
                    vertical: 'bottom',
                    horizontal: 'center'
                },
                title: 'Warning',
                alertType: 'info',
                body: 'this procedure is already configured'
            });
        } else {
            this.selectedprocedure = { ...selected };
            this.communicatioservice.onprocedureselected.next({ selectiontype: 'newprocedure', selection: { customprocedure: emptycustomprocedure, rawprocedure: selected } });
        }
    }

    toggleSidebar(name): void {
        this._fuseSidebarService.getSidebar(name).toggleOpen();
    }

    setexpanded(id: number): void {
        this.expandedlist = id;
    }


    setunsuranceprice(insurance: { [key: string]: Paymentmethods }, value): void {
        console.log(value, insurance);
    }

}
