import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxIcon } from './ngx-icons-extra';

describe('NgxIcon', () => {
  let component: NgxIcon;
  let fixture: ComponentFixture<NgxIcon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxIcon],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(NgxIcon);
    fixture.componentRef.setInput('collection', 'mdi');
    fixture.componentRef.setInput('icon', 'home');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
