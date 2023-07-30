import { NgModule, Provider } from '@angular/core';
import {
  MessagesClientInboxJourneyConfiguration,
  MessagesClientInboxJourneyConfigurationToken,
  MessagesClientInboxJourneyModule,
  MESSAGES_CLIENT_INBOX_JOURNEY_MESSAGES_BASE_PATH,
} from '@backbase/messages-client-inbox-journey-ang';
import { APP_MESSAGES_BASE_PATH } from '../service-paths.module';

const WealthConfigProvider: Provider = {
  provide: MessagesClientInboxJourneyConfigurationToken,
  useValue: {
    headingTitle: 'Inbox',
    headingType: 'h1',
    headingClasses: '',
    headingWrapperClasses: 'bb-heading-widget--de-elevated',
    tabsWrapperClasses: 'd-block container--drag-up mx-4 pt-5 bb-tab--inverse',
    buttonText: 'Compose',
    buttonClasses: '',
    createMessageOpenEventName: 'bb.event.messages.create.message.open',
    createMessageClosedEventName: 'bb.event.messages.create.message.close',
    itemsPerPage: 10,
    customerServiceTitle: 'Customer Service',
    hideAssignedToColumn: false,
    maxAttachmentSize: '10',
    replyMessageMaxLength: '300',
    maxSubjectLength: 100,
    maxMessageLength: 300,
    modalHeader: 'New message',
    hideComposeButton: true,
  } as Partial<MessagesClientInboxJourneyConfiguration>,
};

@NgModule({
  imports: [MessagesClientInboxJourneyModule.forRoot()],
  providers: [
    WealthConfigProvider,
    {
      provide: MESSAGES_CLIENT_INBOX_JOURNEY_MESSAGES_BASE_PATH,
      useExisting: APP_MESSAGES_BASE_PATH,
    },
  ],
})
export class MessagesClientInboxJourneyBundleModule {}
