import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { fuseAnimations } from '../../../@fuse/animations';
import { FuseSidebarService } from '../../../@fuse/components/sidebar/sidebar.service';
import { MatTabChangeEvent } from '@angular/material';
import { LocalcommunicationService } from './current/localcommunication.service';
import { QueueService } from '../services/queue.service';
import { PaymentmethodService } from 'app/pages/services/paymentmethod.service';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-queue',
    templateUrl: './queue.component.html',
    styleUrls: ['./queue.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations

})
export class QueueComponent implements OnInit, OnDestroy {
    searchInput: FormControl;
    activetabindex = 0;
    links = ['/First', 'Second', 'Third'];
    activeLink = this.links[0];
    currentpatient = false;
    mainQueue = 0;
    myQueue = 0;
    comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

    constructor(private _fuseSidebarService: FuseSidebarService,
        private communication: LocalcommunicationService, private payment: PaymentmethodService,
        private queueservice: QueueService) {
        this.communication.ontabchanged
            .pipe(takeUntil(this.comopnentDestroyed))
            .subscribe(tabindex => {
                this.activetabindex = tabindex;
            });
        this.queueservice.mainpatientsqueue
            .pipe(takeUntil(this.comopnentDestroyed))
            .subscribe(main => {
                if (!main) {
                    return;
                }
                console.log(main);
                this.mainQueue = main.size;
            });
        this.queueservice.mypatientqueue
            .pipe(takeUntil(this.comopnentDestroyed))
            .subscribe(mine => {
                if (!mine) {
                    return;
                }
                this.myQueue = mine.size;
            });
        this.queueservice.currentpatient
            .pipe(takeUntil(this.comopnentDestroyed))
            .subscribe(current => {
                if (!current || !current.patientdata) {
                    this.currentpatient = false;
                    return;
                }
                this.currentpatient = !!current.patientdata._id;
            });
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
        this.comopnentDestroyed.next(true);
    }

    /**
     * Toggle the sidebar
     *
     * @param name
     */
    toggleSidebar(name): void {
        this._fuseSidebarService.getSidebar(name).toggleOpen();
    }

    tabChanged = (tabChangeEvent: MatTabChangeEvent): void => {
        this.communication.resetall();
        this.communication.ontabchanged.next(tabChangeEvent.index);
    }
}
