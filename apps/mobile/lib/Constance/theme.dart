// ignore_for_file: prefer_const_constructors, deprecated_member_use, prefer_interpolation_to_compose_strings

import 'package:eveno/Constance/constance.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static bool isLightTheme = true;

  static ThemeData getTheme() {
    if (isLightTheme) {
      return lightTheme();
    } else {
      return darkTheme();
    }
  }

  static TextTheme _buildTextTheme(TextTheme base) {
    return base.copyWith(
      titleMedium: GoogleFonts.urbanist(
          textStyle: TextStyle(color: base.titleMedium!.color, fontSize: 15)),
      titleSmall: GoogleFonts.urbanist(
          textStyle: TextStyle(
              color: base.bodySmall!.color,
              fontSize: 15,
              fontWeight: FontWeight.w500)),
      bodyLarge: GoogleFonts.urbanist(
          textStyle: TextStyle(color: base.bodyLarge!.color, fontSize: 14)),
      bodyMedium: GoogleFonts.urbanist(
          textStyle: TextStyle(color: base.bodyMedium!.color, fontSize: 16)),
      labelLarge: GoogleFonts.urbanist(
          textStyle: TextStyle(
              color: base.labelLarge!.color,
              fontSize: 14,
              fontWeight: FontWeight.w500)),
      displayLarge: GoogleFonts.libreBaskerville(
          textStyle: TextStyle(
              color: base.titleMedium!.color,
              fontSize: 15,
              fontWeight: FontWeight.w500)),
      bodySmall: GoogleFonts.urbanist(
          textStyle: TextStyle(color: base.bodySmall!.color, fontSize: 12)),
      headlineMedium: GoogleFonts.libreBaskerville(
          textStyle: TextStyle(color: base.headlineMedium!.color, fontSize: 24)),
      displaySmall: GoogleFonts.libreBaskerville(
          textStyle: TextStyle(
              color: base.displaySmall!.color,
              fontSize: 40,
              fontWeight: FontWeight.w600)),
      displayMedium: GoogleFonts.libreBaskerville(
          textStyle: TextStyle(color: base.displayMedium!.color, fontSize: 60)),
      headlineSmall: GoogleFonts.libreBaskerville(
          textStyle: TextStyle(
              color: base.headlineSmall!.color,
              fontSize: 20.5,
              fontWeight: FontWeight.w700)),
      titleLarge: GoogleFonts.libreBaskerville(
          textStyle: TextStyle(
              color: base.titleLarge!.color,
              fontSize: 20,
              fontWeight: FontWeight.w500)),
      labelSmall: GoogleFonts.urbanist(
          textStyle: TextStyle(color: base.labelSmall!.color, fontSize: 10)),
    );
  }

  static ThemeData lightTheme() {
    Color primaryColor = HexColor(primaryColorString);
    Color secondaryColor = HexColor(secondaryColorString);
    final ColorScheme colorScheme = ColorScheme.light().copyWith(
      primary: secondaryColor,
      secondary: Colors.white,
    );

    final ThemeData base = ThemeData.light();
    return base.copyWith(
      appBarTheme: AppBarTheme(color: Colors.white),
      popupMenuTheme: PopupMenuThemeData(color: Colors.white),
      iconTheme: IconThemeData(color: Color(0xff2b2b2b)),
      primaryColor: primaryColor,
      splashColor: Colors.white.withOpacity(0.1),
      hoverColor: Colors.transparent,
      splashFactory: InkRipple.splashFactory,
      highlightColor: Colors.transparent,
      canvasColor: Colors.transparent,
      scaffoldBackgroundColor: Colors.white,
      textTheme: _buildTextTheme(base.textTheme),
      primaryTextTheme: _buildTextTheme(base.textTheme),
      platform: TargetPlatform.iOS,
      disabledColor: HexColor("#9CA3AF"),
      buttonTheme: ButtonThemeData(
        colorScheme: colorScheme,
        textTheme: ButtonTextTheme.primary,
      ),
      cardColor: Colors.white,
      colorScheme: colorScheme.copyWith(
        surface: Colors.white,
        error: Colors.red,
      ),
      tabBarTheme: TabBarThemeData(indicatorColor: primaryColor),
    );
  }

  static ThemeData darkTheme() {
    Color primaryColor = HexColor(primaryColorString);
    Color secondaryColor = HexColor(secondaryColorString);
    final ColorScheme colorScheme = ColorScheme.dark().copyWith(
      primary: primaryColor,
      secondary: secondaryColor,
    );
    final ThemeData base = ThemeData.dark();
    return base.copyWith(
      appBarTheme: AppBarTheme(color: Colors.grey[700]),
      popupMenuTheme: PopupMenuThemeData(color: Colors.black),
      iconTheme: IconThemeData(color: Colors.white),
      primaryColor: primaryColor,
      splashColor: Colors.white24,
      splashFactory: InkRipple.splashFactory,
      canvasColor: Colors.transparent,
      scaffoldBackgroundColor: Color(0xff111827),
      buttonTheme: ButtonThemeData(
        colorScheme: colorScheme,
        textTheme: ButtonTextTheme.primary,
      ),
      textTheme: _buildTextTheme(base.textTheme),
      primaryTextTheme: _buildTextTheme(base.primaryTextTheme),
      platform: TargetPlatform.iOS,
      disabledColor: HexColor("#6B7280"),
      cardColor: HexColor("#23262F"),
      colorScheme: colorScheme.copyWith(
        surface: Color(0xff1c1d21),
        error: Colors.red,
      ),
      tabBarTheme: TabBarThemeData(indicatorColor: Colors.white),
    );
  }
}

class HexColor extends Color {
  static int _getColorFromHex(String hexColor) {
    hexColor = hexColor.toUpperCase().replaceAll("#", "");
    if (hexColor.length == 6) {
      hexColor = "FF" + hexColor;
    }
    return int.parse(hexColor, radix: 16);
  }

  HexColor(final String hexColor) : super(_getColorFromHex(hexColor));
}
