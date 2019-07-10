import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FormControl} from '@angular/forms';
import {fuseAnimations} from '../../../../@fuse/animations';
import {FuseSidebarService} from '../../../../@fuse/components/sidebar/sidebar.service';
import {MatTabChangeEvent} from '@angular/material';
import {LocalcommunicationService} from './current/localcommunication.service';
import {QueueService} from '../../services/queue.service';

@Component({
    selector: 'app-queue',
    templateUrl: './queue.component.html',
    styleUrls: ['./queue.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations

})
export class QueueComponent implements OnInit {
    searchInput: FormControl;
    activetabindex = 0;
    links = ['/First', 'Second', 'Third'];
    activeLink = this.links[0];
    currentpatient = false;
    mainQueue = 0;
    myQueue = 0;

    constructor(private _fuseSidebarService: FuseSidebarService, private communication: LocalcommunicationService, private queueservice: QueueService) {
        this.communication.ontabchanged.subscribe(tabindex => {
            this.activetabindex = tabindex;
        });
        this.queueservice.mainpatientqueue.subscribe(main => {
            this.mainQueue = main.length;
        });
        this.queueservice.mypatientqueue.subscribe(mine => {
            this.myQueue = mine.length;
        });
        this.queueservice.currentpatient.subscribe(current => {
            this.currentpatient = !current.patientdata._id;
        });
    }

    ngOnInit(): void {
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
    };
}
