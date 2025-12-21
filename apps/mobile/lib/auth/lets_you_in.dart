// ignore_for_file: prefer_const_constructors_in_immutables, prefer_const_constructors, deprecated_member_use

import 'package:eveno/Constance/constance.dart';
import 'package:eveno/Constance/theme.dart';
import 'package:eveno/Widget/buttons.dart';
import 'package:eveno/auth/create_new_account.dart';
import 'package:eveno/auth/login_to_your_account.dart';
import 'package:flutter/material.dart';

class LetsYouInScreen extends StatefulWidget {
  LetsYouInScreen({Key? key}) : super(key: key);

  @override
  State<LetsYouInScreen> createState() => _LetsYouInScreenState();
}

class _LetsYouInScreenState extends State<LetsYouInScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: EdgeInsets.only(
            left: 18,
            right: 18,
            top: MediaQuery.of(context).padding.top + 16,
            bottom: MediaQuery.of(context).padding.bottom),
        child: Column(
          children: [
            Row(
              children: [
                InkWell(
                  onTap: () {
                    Navigator.pop(context);
                  },
                  child: Image.asset(
                    AppTheme.isLightTheme
                        ? ConstanceData.s1
                        : ConstanceData.ds1,
                    height: 30,
                  ),
                )
              ],
            ),
            SizedBox(
              height: 40,
            ),
            Expanded(
              child: ListView(
                padding: EdgeInsets.zero,
                children: [
                  Image.asset(
                    AppTheme.isLightTheme
                        ? ConstanceData.s2
                        : ConstanceData.ds2,
                    height: 140,
                  ),
                  SizedBox(
                    height: 20,
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        "Let’s you in",
                        style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                              fontSize: 30,
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                    ],
                  ),
                  SizedBox(
                    height: 20,
                  ),
                  com(
                      AppTheme.isLightTheme
                          ? ConstanceData.s3
                          : ConstanceData.s3,
                      "Continue with Facebook"),
                  SizedBox(
                    height: 10,
                  ),
                  com(
                      AppTheme.isLightTheme
                          ? ConstanceData.s4
                          : ConstanceData.s4,
                      "Continue with Google"),
                  SizedBox(
                    height: 10,
                  ),
                  com(
                      AppTheme.isLightTheme
                          ? ConstanceData.s5
                          : ConstanceData.ds5,
                      "Continue with Apple"),
                  SizedBox(
                    height: 30,
                  ),
                  Row(
                    children: [
                      Expanded(
                        child: Container(
                          height: 1,
                          color: Theme.of(context).dividerColor,
                        ),
                      ),
                      SizedBox(
                        width: 10,
                      ),
                      Text(
                        "or",
                        style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                              fontSize: 16,
                              color: Theme.of(context).disabledColor,
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      SizedBox(
                        width: 10,
                      ),
                      Expanded(
                        child: Container(
                          height: 1,
                          color: Theme.of(context).dividerColor,
                        ),
                      )
                    ],
                  ),
                  SizedBox(
                    height: 30,
                  ),
                  MyButton(
                      btnName: "Sign in with password",
                      click: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => LoginToYourAccountScreen(),
                          ),
                        );
                      }),
                  SizedBox(
                    height: 30,
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        "Don’t have an account?",
                        style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                              fontSize: 12,
                              color: Theme.of(context).dividerColor,
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      InkWell(
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => CreateNewAccountScreen(),
                            ),
                          );
                        },
                        child: Text(
                          " Sign up",
                          style:
                              Theme.of(context).textTheme.bodyLarge!.copyWith(
                                    fontSize: 14,
                                    color: Theme.of(context).primaryColor,
                                    fontWeight: FontWeight.bold,
                                  ),
                        ),
                      )
                    ],
                  )
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget com(String img, String tex) {
    return Container(
      height: 60,
      width: double.infinity,
      decoration: BoxDecoration(
        color: AppTheme.isLightTheme ? Colors.white : HexColor("#35383F"),
        border: Border.all(
          color: Theme.of(context).dividerColor,
        ),
        borderRadius: BorderRadius.all(Radius.circular(15)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Image.asset(
            img,
            height: 25,
          ),
          SizedBox(
            width: 10,
          ),
          Text(
            tex,
            style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                ),
          )
        ],
      ),
    );
  }
}
