import { Component, OnInit, OnDestroy } from '@angular/core';
import { Patient } from 'app/models/patient/Patient';
import { QueueService } from 'app/pages/services/queue.service';
import { MedicalinfoService } from 'app/pages/services/medicalinfo.service';
import { MedicalInfo, Vitals } from 'app/models/patient/MedicalInfo';
import { FormArray, FormControl, FormGroup, FormBuilder } from 'ngx-strongly-typed-forms';
import { Validators } from '@angular/forms';
import { LocalcommunicationService } from '../localcommunication.service';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-med-info',
  templateUrl: './med-info.component.html',
  styleUrls: ['./med-info.component.scss']
})
export class MedInfoComponent implements OnInit, OnDestroy {
  editable = true;
  tempMedinfo: FormGroup<Vitals>;
  init = false;
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  constructor(private queue: QueueService,
    private formBuilder: FormBuilder,
    private comm: LocalcommunicationService
  ) {
    this.queue.currentpatient
      .pipe(takeUntil(this.comopnentDestroyed))

      .subscribe(value => {
        /**
         * make sure we dont mutate the original data
         */
        console.log(value.medicalInfo);
        this.tempMedinfo = this.formBuilder.group<Vitals>({
          height: [value.medicalInfo.vitals.height, Validators.required],
          weight: [value.medicalInfo.vitals.weight, Validators.required],
          hb: [value.medicalInfo.vitals.hb, Validators.required],
          heartRate: [value.medicalInfo.vitals.heartRate, Validators.required],
          pressure: [value.medicalInfo.vitals.pressure, Validators.required],
          sugar: [value.medicalInfo.vitals.sugar, Validators.required],
          respiration: [value.medicalInfo.vitals.respiration, Validators.required],
        });
        this.init = true;
        this.tempMedinfo.valueChanges.subscribe(values => {
          /**
           * No validation for now
           */
          this.comm.vitals = values;
        });
      });

  }
  ngOnDestroy(): void {
    this.comopnentDestroyed.next(true);
  }

  ngOnInit() {
  }

  viewhistory() {

  }
}
