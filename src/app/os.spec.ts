import { TestBed } from '@angular/core/testing';

import { Os } from './os';

describe('Os', () => {
  let service: Os;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Os);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
