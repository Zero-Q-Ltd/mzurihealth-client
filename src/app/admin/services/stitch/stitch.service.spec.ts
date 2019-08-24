import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { StitchService } from './stitch.service';

describe('StitchService', () => {
  let stitchService: StitchService;
  let httpMock: HttpTestingController;

  afterEach(() => {
    httpMock.verify();
  });

  describe('when not logged in', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [StitchService],
      });
    });

    it('should create Stitch Client', () => {
      expect(stitchService.client).toBeTruthy();
    });

    // TODO: write more StitchService tests
    it('...', () => {
      pending('TODO: write more StitchService tests');
    });
  });
});
