import {Component, Input, OnInit} from '@angular/core';
import {LocalcommunicationService} from '../../localcommunication.service';
import {AdminService} from '../../../services/admin.service';
import {NotificationService} from '../../../../shared/services/notifications.service';
import {HospitalAdmin} from '../../../../models/user/HospitalAdmin';
import {AdminCategory} from '../../../../models/user/AdminCategory';

@Component({
    selector: 'admins-adminconfig',
    templateUrl: './adminconfig.component.html',
    styleUrls: ['./adminconfig.component.scss']
})
export class AdminconfigComponent implements OnInit {
    @Input() clickedadmin: HospitalAdmin;
    admincategories: Array<AdminCategory> = [];

    constructor(private communicationservice: LocalcommunicationService,
                private adminService: AdminService,
                private notificationservice: NotificationService) {
        this.communicationservice.onadminselected.subscribe(admin => {
            this.clickedadmin = admin;
        });
        this.adminService.admincategories.subscribe(categories => {
            this.admincategories = categories;
        });
    }

    ngOnInit(): void {
    }

    clearselection(): void {
        this.communicationservice.resetall();
    }

    categoryarray(): Array<string> {
        const categoryid = this.clickedadmin.config.categoryId;
        const subcategory = this.clickedadmin.config.level;
        if (this.admincategories.length > 0) {
            if (this.admincategories.find(cat => {
                return cat._id === categoryid;
            })) {
                const admincategory = this.admincategories.find(cat => {
                    return cat._id === categoryid;
                });
                const adinsubcategory = `${admincategory.subcategories[subcategory].level} : ${admincategory.subcategories[subcategory].name}`;
                return [admincategory.name, adinsubcategory];
            } else {
                return ['Invalid'];
            }
        } else {
            return ['loading...'];
        }
    }

    saveadminconfig(): void {
        if (!null) {

        } else {
            this.notificationservice.notify({
                placement: {
                    vertical: 'bottom',
                    horizontal: 'center'
                },
                title: 'Error',
                alertType: 'error',
                body: 'Regular price is required'
            });
        }
    }
}
