import { Component, OnInit } from '@angular/core';
import { Patient } from 'app/models/patient/Patient';
import { QueueService } from 'app/pages/services/queue.service';

@Component({
  selector: 'app-med-info',
  templateUrl: './med-info.component.html',
  styleUrls: ['./med-info.component.scss']
})
export class MedInfoComponent implements OnInit {
  currentpatient: Patient;

  constructor(private queue: QueueService, ) {
    this.queue.currentpatient.subscribe(value => {
      this.currentpatient = value.patientdata;

    });
  }

  ngOnInit() {
  }

}
