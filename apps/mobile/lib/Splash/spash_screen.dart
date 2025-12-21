// ignore_for_file: deprecated_member_use, prefer_const_constructors_in_immutables, prefer_const_constructors, unnecessary_new, library_private_types_in_public_api, use_build_context_synchronously, unused_import
import 'package:eveno/Constance/constance.dart';
import 'package:eveno/Constance/theme.dart';
import 'package:eveno/Splash/welcome_screen.dart';
import 'package:eveno/main.dart';
import 'package:flutter/material.dart';

class SplashScreen extends StatefulWidget {
  SplashScreen({Key? key}) : super(key: key);

  @override
  _SplashScreenState createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController animationController;

  @override
  void initState() {
    animationController = new AnimationController(
        vsync: this, duration: Duration(milliseconds: 700));
    animationController.forward();
    _loadNextScreen();
    super.initState();
  }

  _loadNextScreen() async {
    await Future.delayed(Duration(milliseconds: 2000));
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => WelcomeScreen(),
      ),
    );
    // Navigator.pushReplacementNamed(context, Routes.INTRODUCTION);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Expanded(child: SizedBox()),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Image.asset(
                AppTheme.isLightTheme
                    ? ConstanceData.logo1
                    : ConstanceData.logo1,
                height: 50,
              ),
              SizedBox(
                width: 10,
              ),
              Text(
                "Eveno",
                style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                      fontSize: 30,
                      fontWeight: FontWeight.bold,
                    ),
              )
            ],
          ),
          Expanded(child: SizedBox()),
          Image.asset(
            ConstanceData.logo2,
            height: 50,
          ),
          SizedBox(
            height: 80,
          ),
        ],
      ),
    );
  }
}
