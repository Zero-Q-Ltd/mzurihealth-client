import { Component, OnInit } from '@angular/core';
import { Patient } from 'app/models/patient/Patient';
import { QueueService } from 'app/pages/services/queue.service';
import { MedicalinfoService } from 'app/pages/services/medicalinfo.service';
import { MedicalInfo } from 'app/models/patient/MedicalInfo';

@Component({
  selector: 'app-med-info',
  templateUrl: './med-info.component.html',
  styleUrls: ['./med-info.component.scss']
})
export class MedInfoComponent implements OnInit {
  currentpatient: Patient;
  editable = true;
  tempMedinfo !: MedicalInfo;

  constructor(private queue: QueueService,
    private medInfo: MedicalinfoService
  ) {
    this.queue.currentpatient.subscribe(value => {
      this.currentpatient = value.patientdata;
      /**
       * make sure we dont mutate the original data
       */
      this.tempMedinfo = { ...value.medicalInfo };
    });
  }

  ngOnInit() {
  }
  save() {
    this.medInfo.updateMedInfo(this.tempMedinfo._id, this.tempMedinfo);
  }
  viewhistory() {

  }
}
