import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedRoutableModalComponent } from './shared-routable-modal.component';
import '@angular/localize/init';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('SharedRoutableModalComponent', () => {
  let component: SharedRoutableModalComponent;
  let fixture: ComponentFixture<SharedRoutableModalComponent>;
  let activatedRoute: ActivatedRoute;
  const routerStub = {
    navigate: jasmine.createSpy('navigate'),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [SharedRoutableModalComponent],
      providers: [
        { provide: Router, useValue: routerStub },
        {
          provide: ActivatedRoute,
          useValue: {
            children: [
              {
                outlet: 'routable-modal-content',
                routeConfig: {
                  children: [
                    {
                      data: {
                        modalTitle: 'modalTitle',
                        modalTitleIcon: 'modalTitle',
                        closeButton: 'modalTitle',
                        showHeader: 'modalTitle',
                      },
                      path: 'routable-modal-content',
                    },
                  ],
                },
              },
            ],
            outlet: 'primary',
            firstChild: {
              snapshot: {
                data: {},
              },
              outlet: 'primary',
            } as ActivatedRoute,
            snapshot: {
              data: {
                title: 'test',
              },
            },
          },
        },
      ],
    });
    fixture = TestBed.createComponent(SharedRoutableModalComponent);
    component = fixture.componentInstance;
    activatedRoute = TestBed.inject(ActivatedRoute);
  });
  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('Should close modal', () => {
    component.closeModal();
    expect(component.isModalOpen$.value).toBeFalsy();
  });

  it('Should open modal', () => {
    component.openModal('routable-modal-content');
    expect(component.isModalOpen$.value).toBeTruthy();
  });

  it('Should call open modal', () => {
    const openModalSpyOn = spyOn(component, 'openModal');
    const closeModalSpyOn = spyOn(component, 'closeModal');
    activatedRoute.queryParams = of({ openedModal: 'routable-modal-content' });
    component.isModalOpen$.next(false);
    component.ngOnInit();
    expect(openModalSpyOn).toHaveBeenCalled();

    component.isModalOpen$.next(true);
    component.ngOnInit();
    expect(closeModalSpyOn).toHaveBeenCalled();
  });
});
