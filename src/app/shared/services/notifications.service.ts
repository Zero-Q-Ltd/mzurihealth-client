import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {Howl} from 'howler';
import {Alert} from '../../models/notification/Alert';
import {NotificationComponent} from '../components/notification/notification.component';
import {MatSnackBar} from '@angular/material';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private notificationSubject = new Subject<Alert>();

    constructor(private snackBar: MatSnackBar) {
        this.notificationSubject.subscribe((alert: Alert) => {
            if (alert.alertType) {
                const config = NotificationService.getsrc(alert);
                const sound = new Howl({
                    src: [config.soundsrc]
                });
                alert.icon = alert.icon || config.icon;
                sound.play();
            }
            this.snackBar.openFromComponent(NotificationComponent, {
                duration: alert.duration ? alert.duration : 2000,
                data: alert,
                horizontalPosition: alert.placement.horizontal,
                verticalPosition: alert.placement.vertical,
                panelClass: ['blue-snackbar']
            });
        });
    }

    private static getsrc(alert: Alert): any {
        switch (alert.alertType) {
            case 'question':
                return {
                    icon: 'attach_money',
                    soundsrc: '../../../assets/sounds/cash.ogg'
                };
            case 'info':
                return {
                    icon: 'info',
                    soundsrc: '../../../assets/sounds/drip.ogg'
                };
            case 'success' :
                return {
                    icon: 'done_outline',
                    soundsrc: '../../../assets/sounds/drums.ogg'
                };
            case 'error':
                return {
                    icon: 'error',
                    soundsrc: '../../../assets/sounds/sonar.ogg'
                };
            case 'warning':
                return {
                    icon: 'warning',
                    soundsrc: '../../../assets/sounds/glass.ogg'
                };

        }
    }

    notify(alert: Alert): void {
        // console.log(alert);
        this.notificationSubject.next(alert);
    }
}
