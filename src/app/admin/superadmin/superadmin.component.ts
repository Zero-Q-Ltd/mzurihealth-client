import {Component, OnInit} from '@angular/core';
import {fuseAnimations} from '../../../@fuse/animations';
import {MatTabChangeEvent} from '@angular/material';
import {FuseSidebarService} from '../../../@fuse/components/sidebar/sidebar.service';
import {LocalcommunicationService} from './localcommunication.service';
import {ProceduresService} from '../services/procedures.service';
import {AdminService} from '../services/admin.service';
import {HospitalAdmin} from '../../models/user/HospitalAdmin';

@Component({
    selector: 'app-admin',
    templateUrl: './superadmin.component.html',
    styleUrls: ['./superadmin.component.scss'],
    animations: fuseAnimations
})
export class SuperadminComponent implements OnInit {
    activeside = false;
    activetabindex = 0;
    /**
     * which sidebar to display, or none
     */
    sidebarstatus = 0;
    clickedadmin: HospitalAdmin;

    constructor(private _fuseSidebarService: FuseSidebarService,
                private  communication: LocalcommunicationService,
                private procedureservice: ProceduresService,
                private adminservice: AdminService) {
        /**
         * toggle the sidebar when aither an admin or a procedure is selected
         * Each one has a different child component attached
         */
        communication.onprocedureselected.subscribe(selection => {
            if (selection.selectiontype) {
                this.sidebarstatus = 1;
                // this._fuseSidebarService.getSidebar('procedureconfig-sidebar').toggleOpen()
            } else {
                this.sidebarstatus = 0;
                // this._fuseSidebarService.getSidebar('procedureconfig-sidebar').toggleOpen()
            }
        });
        this.communication.onadminselected.subscribe(admin => {
            this.clickedadmin = admin;
        });
        communication.onadminselected.subscribe(admin => {
            if (admin._id) {
                this.sidebarstatus = 2;
            } else {
                this.sidebarstatus = 0;
            }
        });
        this.communication.ontabchanged.subscribe(tabindex => {
            this.activetabindex = tabindex;
        });
    }

    ngOnInit(): void {
        /**
         * Clear the buffers on load
         */
        this.communication.resetall();
    }

    tabChanged = (tabChangeEvent: MatTabChangeEvent): void => {
        this.communication.resetall();
        this.activeside = false;
        this.communication.ontabchanged.next(tabChangeEvent.index);
    };

    toggleactiveside(): void {
        this.activeside = !this.activeside;
        // this.procedureservice.syncprocedures();
        // this.adminservice.initusertypes();
    }

    /**
     * used to display the sidebar
     * @param name
     */
    toggleSidebar(name): void {
        this._fuseSidebarService.getSidebar(name).toggleOpen();
    }
}
