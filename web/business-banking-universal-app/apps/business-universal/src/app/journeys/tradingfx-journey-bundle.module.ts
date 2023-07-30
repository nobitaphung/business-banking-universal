import { NgModule } from '@angular/core';
import {
  TradingfxConfiguration,
  TradingfxConfigurationToken,
  TradingfxJourneyModule,
  TRADINGFX_JOURNEY_FOREX_BASE_PATH,
  TRADINGFX_JOURNEY_ARRANGEMENT_MANAGER_BASE_PATH,
} from '@backbase/tradingfx-journey-ang';
import { APP_ARRANGEMENT_MANAGER_BASE_PATH, APP_TRADINGFX_BASE_PATH } from '../service-paths.module';

@NgModule({
  imports: [TradingfxJourneyModule.forRoot()],
  providers: [
    {
      provide: TradingfxConfigurationToken,
      useValue: {
        currencies: {
          pageSize: 6,
          visibilityOfPairInfo: true,
          typeOfCalculation: 'open_close',
        },
        favorite: {
          pageSize: 6,
          visibilityOfPairInfo: false,
          typeOfCalculation: 'open_close',
        },
        expireTime: '1:00',
        autoUpdateInterval: 3,
        detail: {
          typeOfCalculation: 'ask_bid',
        },
      } as TradingfxConfiguration,
    },
    {
      provide: TRADINGFX_JOURNEY_FOREX_BASE_PATH,
      useExisting: APP_TRADINGFX_BASE_PATH,
    },
    {
      provide: TRADINGFX_JOURNEY_ARRANGEMENT_MANAGER_BASE_PATH,
      useExisting: APP_ARRANGEMENT_MANAGER_BASE_PATH,
    },
  ],
})
export class TradingfxJourneyBundleModule {}
