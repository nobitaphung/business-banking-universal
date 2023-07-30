import { Component, Inject, Input, OnInit, Optional } from '@angular/core';
import { PubSubService } from '@backbase/foundation-ang/web-sdk';
import { SharedUserContextService } from '@backbase/shared/feature/user-context';
import { LayoutService } from '@backbase/ui-ang/layout';
import { EventStatus, IEventPayload, IProgressTrackerConfig } from '@backbase/ui-ang/progress-tracker';
import { BackbaseVersionConfig, BACKBASE_APP_VERSION } from '@backbase/shared/util/app-core';
import { FocusHandlerService } from '@backbase/shared/util/app-core';

@Component({
  selector: 'bb-top-bar-menu',
  templateUrl: './top-bar-menu.component.html',
})
export class TopBarMenuComponent implements OnInit {
  @Input() notificationsAllowedRoutes = '';
  @Input() displayNotificationSettingsButton!: boolean;

  readonly appVersion = this.version?.calendarVersion;

  constructor(
    public readonly layoutService: LayoutService,
    public readonly userContextService: SharedUserContextService,
    private readonly eventBus: PubSubService,
    @Optional() @Inject(BACKBASE_APP_VERSION) private version: BackbaseVersionConfig,
    public readonly focusHandler: FocusHandlerService,
  ) {}

  public eventArr: IProgressTrackerConfig[] = [];
  public hostRef = this;

  ngOnInit(): void {
    this.eventBus.subscribe('bb.event.tracker', (data: { payload: IProgressTrackerConfig }) => {
      const existingEvent = this.eventArr?.find((events) => events.id === data.payload.id);

      if (existingEvent && existingEvent !== undefined) {
        existingEvent.payload = data.payload.payload;
      }
      this.eventArr = this.eventArr.find((events) => events.id === data.payload?.id)
        ? [...this.eventArr.filter((item: IProgressTrackerConfig) => item.eventStatus === EventStatus.IN_PROGRESS)]
        : [
            ...this.eventArr.filter((item: IProgressTrackerConfig) => item.eventStatus === EventStatus.IN_PROGRESS),
            data.payload,
          ];
    });
    this.eventBus.subscribe('bb.event.tracker.cancel', this.completeAction.bind(this));
    this.eventBus.subscribe('bb.event.tracker.destroy', this.completeAction.bind(this));
  }

  public cancelTracker = (payload: IEventPayload | undefined) => {
    this.eventBus.publish('bb.event.tracker.cancel', payload);
    const index = this.eventArr.findIndex((item: IProgressTrackerConfig) => item.id === payload?.itemId);
    if (index > -1) {
      this.eventArr.splice(index, 1);
    }
  };

  public cancelTrackerbyId(id: string) {
    this.cancelTracker(this.eventArr.find((event) => event.id === id)?.payload);
  }

  private completeAction() {
    this.eventArr = this.eventArr.map((item: IProgressTrackerConfig) => {
      item.eventStatus = EventStatus.COMPLETED;

      return item;
    });
  }
}
