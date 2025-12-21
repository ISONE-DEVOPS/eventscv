// ignore_for_file: deprecated_member_use, non_constant_identifier_names, prefer_const_constructors, constant_identifier_names, unused_import

import 'package:eveno/Constance/theme.dart';
import 'package:eveno/Explore/62_maps_version2.dart';
import 'package:eveno/Explore/63_maps_version3.dart';
import 'package:eveno/Explore/65_maps_version_4.dart';
import 'package:eveno/Favorites/66_favorites_cards.dart';
import 'package:eveno/Profile/80_settings_profile.dart';
import 'package:eveno/Profile/81_notification.dart';
import 'package:eveno/Profile/82_payments.dart';
import 'package:eveno/Profile/83_settings_linked_accounts.dart';
import 'package:eveno/Profile/84_settings_security.dart';
import 'package:eveno/Profile/85_settings_language.dart';
import 'package:eveno/Profile/87_settings_invited_friends.dart';
import 'package:eveno/Profile/88_settings_help_center_FAQ.dart';
import 'package:eveno/Splash/onboarding.dart';
import 'package:eveno/Splash/spash_screen.dart';
import 'package:eveno/Splash/welcome_screen.dart';
import 'package:eveno/Widget/buttons.dart';
import 'package:eveno/auth/21_light_face_recognition_scan.dart';
import 'package:eveno/auth/create_new_account.dart';
import 'package:eveno/auth/create_new_password.dart';
import 'package:eveno/auth/create_new_pin.dart';
import 'package:eveno/auth/face_recognition.dart';
import 'package:eveno/auth/fill_your_profile.dart';
import 'package:eveno/auth/fingerprint.dart';
import 'package:eveno/auth/forgot_password.dart';
import 'package:eveno/auth/lets_you_in.dart';
import 'package:eveno/auth/login_to_your_account.dart';
import 'package:eveno/auth/otp_code_verification.dart';
import 'package:eveno/auth/photo_ID_card.dart';
import 'package:eveno/auth/selfie_with_ID_card.dart';
import 'package:eveno/auth/set_your_location.dart';
import 'package:eveno/booking/47_booking_choose_seat.dart';
import 'package:eveno/booking/48_information_details.dart';
import 'package:eveno/booking/49_select_payment_methods.dart';
import 'package:eveno/booking/50_add_new_card.dart';
import 'package:eveno/booking/51_select_payment_methods_2.dart';
import 'package:eveno/booking/52_review_summary.dart';
import 'package:eveno/booking/53_enter_PIN.dart';
import 'package:eveno/booking/56_view_e-ticket_full_page_version1.dart';
import 'package:eveno/booking/58_view_e-ticket_full_page_version2.dart';
import 'package:eveno/home/31_notification.dart';
import 'package:eveno/home/32_popular_event.dart';
import 'package:eveno/home/35_search_results_list.dart';
import 'package:eveno/home/38_event_details_full_page.dart';
import 'package:eveno/home/42_event_details_people_going.dart';
import 'package:eveno/home/43_event_location.dart';
import 'package:eveno/home/44_event_location_direction.dart';
import 'package:eveno/home/45_organizer.dart';
import 'package:eveno/home/46_gallery_pre_event.dart';
import 'package:eveno/home/home_screen.dart';
import 'package:eveno/pageview.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get_navigation/src/root/get_material_app.dart';
import 'package:provider/provider.dart';

// Core imports
import 'package:eveno/core/config/firebase_config.dart';
import 'package:eveno/core/providers/auth_provider.dart';
import 'package:eveno/core/providers/event_provider.dart';
import 'package:eveno/core/providers/ticket_provider.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Firebase
  await FirebaseConfig.initialize();

  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  static setCustomeTheme(BuildContext context, int index) {
    final _MyAppState? state = context.findAncestorStateOfType<_MyAppState>();
    state!.setCustomeTheme(index);
  }

  const MyApp({Key? key}) : super(key: key);

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  setCustomeTheme(int index) {
    if (index == 6) {
      setState(() {
        AppTheme.isLightTheme = true;
      });
    } else if (index == 7) {
      setState(() {
        AppTheme.isLightTheme = false;
      });
    } else {}
  }

  @override
  Widget build(BuildContext context) {
    Future.delayed(const Duration(milliseconds: 1)).then(
      (value) => SystemChrome.setSystemUIOverlayStyle(
        SystemUiOverlayStyle(
          statusBarColor: Colors.transparent,
          statusBarIconBrightness:
              AppTheme.isLightTheme ? Brightness.dark : Brightness.light,
          statusBarBrightness:
              AppTheme.isLightTheme ? Brightness.light : Brightness.dark,
          systemNavigationBarColor: Colors.black,
          systemNavigationBarDividerColor: Colors.grey,
          systemNavigationBarIconBrightness:
              AppTheme.isLightTheme ? Brightness.dark : Brightness.light,
        ),
      ),
    );

    // Wrap app with MultiProvider for state management
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()..initialize()),
        ChangeNotifierProvider(create: (_) => EventProvider()),
        ChangeNotifierProvider(create: (_) => TicketProvider()),
      ],
      child: GetMaterialApp(
        title: "EventsCV",
        navigatorKey: NavKey.navKey,
        theme: AppTheme.getTheme(),
        debugShowCheckedModeBanner: false,
        routes: routes,
        // home: PageScreen(),
      ),
    );
  }

  var routes = <String, WidgetBuilder>{
    Routes.SPLASH: (BuildContext context) => SplashScreen(),
    Routes.INTRODUCTION: (BuildContext context) => OnBoardingScreen(),
    Routes.HOME: (BuildContext context) => PageScreen(),
  };
}

class Routes {
  static String SPLASH = "/";
  static const String INTRODUCTION = "/Splash/onboarding";
  static const String HOME = "/home/home_screen";
}

class NavKey {
  static final navKey = GlobalKey<NavigatorState>();
}
