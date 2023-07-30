import { fakeAsync, tick } from '@angular/core/testing';
import { ConditionsService } from '@backbase/foundation-ang/entitlements';

import { environment } from '../../../environments/environment';

import { canViewManageNotifications } from '../../auth/permissions';

import { SelfServiceViewComponent } from './self-service-view.component';

describe('SelfServiceViewComponent', () => {
  let subjectUnderTest: SelfServiceViewComponent;

  const conditionsServiceStub: Pick<ConditionsService, 'resolveEntitlements'> = {
    resolveEntitlements(condition: string) {
      return Promise.resolve([undefined, canViewManageNotifications].includes(condition));
    },
  };

  beforeEach(() => {
    environment.notificationPreferencesApiMode = 'engagements';
    subjectUnderTest = new SelfServiceViewComponent(conditionsServiceStub as ConditionsService);
  });

  describe('tabs base on canView and entitlements pemission', () => {
    it('should return all tabs for menu with actions mode', (done) => {
      environment.notificationPreferencesApiMode = 'actions';
      subjectUnderTest.tabs$.subscribe((items) => {
        expect(items).toEqual(subjectUnderTest['tabs']);
        done();
      });
    });

    it('should return all tabs for menu with engagements mode and permissions', (done) => {
      environment.notificationPreferencesApiMode = 'engagements';
      subjectUnderTest.tabs$.subscribe((items) => {
        expect(items).toEqual(subjectUnderTest['tabs']);
        done();
      });
    });

    it('should return tabs without failed entitlements check', (done) => {
      spyOn(conditionsServiceStub, 'resolveEntitlements').and.returnValue(Promise.resolve(false));

      const expectedTabs = subjectUnderTest['tabs'].filter((item) => item.route !== 'manage-notifications');
      subjectUnderTest.tabs$.subscribe((items) => {
        expect(items).toEqual(expectedTabs);
        done();
      });
    });
  });
});
