import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxIconsExtra } from './ngx-icons-extra';

describe('NgxIconsExtra', () => {
  let component: NgxIconsExtra;
  let fixture: ComponentFixture<NgxIconsExtra>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxIconsExtra]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgxIconsExtra);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
