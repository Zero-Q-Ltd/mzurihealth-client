import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main/main.component';
import { MineComponent } from './mine/mine.component';
import { QueueRoutingModule } from './queue-routing.module';
import { QueueComponent } from './queue.component';
import { MainSharedModule } from '../shared/main-shared.module';
import { GeneralNotesComponent } from './current/generalnotes/general-notes.component';
import { HistoryComponent } from './current/history/history.component';
import { CurrentComponent } from './current/current.component';
import { GeneralDetailsComponent } from './current/generaldetails/general-details.component';
import { FuseSharedModule } from '../../../@fuse/shared.module';
import { FuseWidgetModule } from '../../../@fuse/components';
import { AdminSelectionComponent } from './admin-selection/admin-selection.component';
import { PerformProcedureComponent } from './current/perform-procedure/perform-procedure.component';
import { MedInfoComponent } from './current/med-info/med-info.component';
import { AllergiesComponent } from './current/allergies/allergies.component';
import { ConditionsComponent } from './current/conditions/conditions.component';

@NgModule({
    declarations: [MainComponent,
        MineComponent,
        QueueComponent,
        GeneralDetailsComponent,
        GeneralNotesComponent,
        HistoryComponent,
        CurrentComponent,
        AdminSelectionComponent,
        PerformProcedureComponent,
        MedInfoComponent,
        AllergiesComponent,
        ConditionsComponent],
    imports: [
        CommonModule,
        QueueRoutingModule,
        MainSharedModule,
        FuseSharedModule,
        FuseWidgetModule
    ],
    entryComponents: [AdminSelectionComponent, PerformProcedureComponent,]
})
export class QueueModule {
}
