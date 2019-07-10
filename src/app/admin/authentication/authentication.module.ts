import {NgModule} from '@angular/core';
import {AuthenticationRoutingModule} from './authentication-routing.module';
import {MailConfirmModule} from './mail-confirm/mail-confirm.module';
import {LockModule} from './lock/lock.module';
import {Login2Module} from './login-2/login-2.module';
import {ResetPassword2Module} from './reset-password-2/reset-password-2.module';

@NgModule({
    imports: [
        AuthenticationRoutingModule,
        MailConfirmModule,
        LockModule,
        Login2Module,
        MailConfirmModule,
        ResetPassword2Module
    ],
    declarations: []
})
export class AuthenticationModule {
}
