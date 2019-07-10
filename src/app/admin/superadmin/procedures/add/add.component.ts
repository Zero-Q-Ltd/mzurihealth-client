import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {fuseAnimations} from '../../../../../@fuse/animations';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ProceduresService} from '../../../services/procedures.service';
import {ProcedureCategory} from '../../../../models/procedure/ProcedureCategory';
import {emptyprawrocedure, RawProcedure, RawProcedureCategory} from '../../../../models/procedure/RawProcedure';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {FuseSidebarService} from '../../../../../@fuse/components/sidebar/sidebar.service';
import {LocalcommunicationService} from '../../localcommunication.service';
import {NotificationService} from '../../../../shared/services/notifications.service';
import {emptycustomprocedure} from '../../../../models/procedure/CustomProcedure';
import {Paymentmethods} from '../../../../models/payment/PaymentChannel';

@Component({
    selector: 'procedure-add',
    templateUrl: './add.component.html',
    styleUrls: ['./add.component.scss'],
    animations: [fuseAnimations]
})
export class AddComponent implements OnInit, AfterViewInit {
    proceduresform: FormGroup;
    procedurecategories: Array<ProcedureCategory> = [];
    loadingprocedures = false;
    insuranceprices: {
        [key: string]: number
    };
    expandedlist = 0;
    selectedprocedure: RawProcedure = {...emptyprawrocedure};
    procedureheaders = ['name', 'category', 'minprice', 'maxprice'];
    categoryprocedures = new MatTableDataSource<RawProcedure>();

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    constructor(private _formBuilder: FormBuilder,
                private _fuseSidebarService: FuseSidebarService,
                private procedureservice: ProceduresService,
                private communicatioservice: LocalcommunicationService,
                private notificationservice: NotificationService) {
        procedureservice.procedurecategories.subscribe(categories => {
            this.procedurecategories = categories;
        });
    }

    ngOnInit() {
        this.proceduresform = this._formBuilder.group({
            category: ['', Validators.required],
        });
        this.proceduresform.get('category').valueChanges.subscribe((category: ProcedureCategory) => {
            this.loadingprocedures = true;
            this.categoryprocedures.data = [];
            this.procedureservice.fetchproceduresincategory(category.id).get().then(rawprocedures => {
                this.categoryprocedures.data = rawprocedures.docs.map(rawcat => {
                    const cat = rawcat.data() as RawProcedure;
                    cat.id = rawcat.id;
                    return cat;
                });
                this.loadingprocedures = false;
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
            return this.procedurecategories.find(cat => {
                return cat.id === category.id;
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

        if (this.procedureservice.hospitalprocedures.value.find(merged => {
            return merged.rawProcedure.id === selected.id;
        })) {
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
            this.selectedprocedure = selected;
            this.communicatioservice.onprocedureselected.next({selectiontype: 'newprocedure', selection: {customprocedure: emptycustomprocedure, rawprocedure: selected}});
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
