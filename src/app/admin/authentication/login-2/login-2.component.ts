import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import {FuseConfigService} from '@fuse/services/config.service';
import {fuseAnimations} from '@fuse/animations';
import {FuseSplashScreenService} from '../../../../@fuse/services/splash-screen.service';
import {AdminService} from '../../services/admin.service';
import {HospitalAdmin} from '../../../models/user/HospitalAdmin';
import {Router} from '@angular/router';
import { StitchService } from 'app/admin/services/stitch/stitch.service';

@Component({
    selector: 'login-2',
    templateUrl: './login-2.component.html',
    styleUrls: ['./login-2.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class Login2Component implements OnInit {
    loginForm: FormGroup;
    loading = false;
    infofield: string = null;

    /**
     * Constructor
     *
     * @param {FuseConfigService} _fuseConfigService
     * @param {FormBuilder} _formBuilder
     * @param _fuseSplashScreenService
     * @param adminservice
     * @param router
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _formBuilder: FormBuilder,
        private _fuseSplashScreenService: FuseSplashScreenService,
        private adminservice: AdminService,
        private router: Router,
        private stitch: StitchService
    ) {
        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar: {
                    hidden: true
                },
                toolbar: {
                    hidden: true
                },
                footer: {
                    hidden: true
                },
                sidepanel: {
                    hidden: true
                }
            }
        };
        this.adminservice.observableuserdata.subscribe((admin: HospitalAdmin) => {
            if (admin && admin._id) {
                this.router.navigate(['/admin']);
            }
        });
    }

    loginWithGoogle(): void {
        this.stitch.loginWithGoogle();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.loginForm = this._formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
    }
}
