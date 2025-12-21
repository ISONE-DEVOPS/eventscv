/// App configuration constants
class AppConfig {
  // App info
  static const String appName = 'EventsCV';
  static const String appVersion = '1.0.0';

  // Default values
  static const String defaultCurrency = 'CVE';
  static const String defaultLanguage = 'pt';
  static const String defaultTimezone = 'Atlantic/Cape_Verde';
  static const String defaultCountry = 'Cabo Verde';

  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;

  // Cache durations (in minutes)
  static const int eventsCacheDuration = 5;
  static const int userCacheDuration = 10;

  // Feature flags
  static const bool enableNfc = true;
  static const bool enableCashless = true;
  static const bool enableOfflineMode = true;

  // Social auth providers
  static const bool enableGoogleAuth = true;
  static const bool enableAppleAuth = true;
  static const bool enableFacebookAuth = false;

  // Support
  static const String supportEmail = 'suporte@eventscv.cv';
  static const String supportPhone = '+238 xxx xxxx';
  static const String websiteUrl = 'https://eventscv.cv';
  static const String privacyPolicyUrl = 'https://eventscv.cv/privacy';
  static const String termsUrl = 'https://eventscv.cv/terms';
}

/// Islands of Cabo Verde
class CaboVerdeIslands {
  static const List<String> all = [
    'Santiago',
    'São Vicente',
    'Santo Antão',
    'Fogo',
    'Sal',
    'Boa Vista',
    'Maio',
    'São Nicolau',
    'Brava',
  ];

  static const Map<String, List<String>> cities = {
    'Santiago': ['Praia', 'Assomada', 'Tarrafal', 'Santa Cruz', 'São Domingos'],
    'São Vicente': ['Mindelo'],
    'Santo Antão': ['Porto Novo', 'Ribeira Grande', 'Paul'],
    'Fogo': ['São Filipe', 'Mosteiros'],
    'Sal': ['Santa Maria', 'Espargos'],
    'Boa Vista': ['Sal Rei'],
    'Maio': ['Vila do Maio'],
    'São Nicolau': ['Ribeira Brava', 'Tarrafal de São Nicolau'],
    'Brava': ['Nova Sintra'],
  };
}
