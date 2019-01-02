package com.gruelbox.orko.exchange;

import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.knowm.xchange.service.trade.TradeService;

import com.google.inject.Inject;
import com.gruelbox.orko.OrkoConfiguration;

class TradeServiceFactoryImpl implements TradeServiceFactory {

  private final ExchangeService exchangeService;
  private final OrkoConfiguration configuration;
  private final PaperTradeService.Factory paperTradeServiceFactory;

  @Inject
  TradeServiceFactoryImpl(ExchangeService exchangeService, OrkoConfiguration configuration, PaperTradeService.Factory paperTradeServiceFactory) {
    this.exchangeService = exchangeService;
    this.configuration = configuration;
    this.paperTradeServiceFactory = paperTradeServiceFactory;
  }

  @Override
  public TradeService getForExchange(String exchange) {
    Map<String, ExchangeConfiguration> exchangeConfig = configuration.getExchanges();
    if (exchangeConfig == null) {
      return paperTradeServiceFactory.getForExchange(exchange);
    }
    final ExchangeConfiguration exchangeConfiguration = configuration.getExchanges().get(exchange);
    if (exchangeConfiguration == null || StringUtils.isEmpty(exchangeConfiguration.getApiKey())) {
      return paperTradeServiceFactory.getForExchange(exchange);
    }
    return exchangeService.get(exchange).getTradeService();
  }
}