import { NgModule, Provider } from '@angular/core';
import {
  TRADE_FINANCE_CONFIGURATION_TOKEN,
  TradeFinanceJourneyConfiguration,
  TradeFinanceJourneyModule,
  LETTER_OF_CREDIT_FLOW_API_BASE_PATH,
} from '@backbase/trade-finance-journey-ang';
import { FlowInteractionServiceMocksProvider } from '@backbase/trade-finance-mocks-ang';
import { environment } from '../../environments/environment';

// Since the FlowInteractionService is provided inside of the TradeFinanceJourneyModule the mocks are to be defined here.
// Any mocks for the FlowInteractionService defined at the AppModule level won't work.

const MOCK_PROVIDERS: Provider[] = (environment.production && []) || [FlowInteractionServiceMocksProvider];

@NgModule({
  imports: [TradeFinanceJourneyModule.forRoot()],
  providers: [
    {
      provide: TRADE_FINANCE_CONFIGURATION_TOKEN,
      useValue: {} as Partial<TradeFinanceJourneyConfiguration>,
    },
    {
      provide: LETTER_OF_CREDIT_FLOW_API_BASE_PATH,
      useValue: environment.apiRoot,
    },
    ...MOCK_PROVIDERS,
  ],
})
export class TradeFinanceJourneyBundleModule {}
