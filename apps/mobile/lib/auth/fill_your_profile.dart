// ignore_for_file: prefer_const_constructors, deprecated_member_use

import 'package:eveno/Constance/constance.dart';
import 'package:eveno/Constance/theme.dart';
import 'package:eveno/Widget/textFiealds.dart';
import 'package:eveno/auth/set_your_location.dart';
import 'package:flutter/material.dart';

import '../Widget/buttons.dart';

class FillYourProfileScreen extends StatefulWidget {
  // ignore: prefer_const_constructors_in_immutables
  FillYourProfileScreen({Key? key}) : super(key: key);

  @override
  State<FillYourProfileScreen> createState() => _FillYourProfileScreenState();
}

class _FillYourProfileScreenState extends State<FillYourProfileScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: EdgeInsets.only(
            left: 16,
            right: 16,
            top: MediaQuery.of(context).padding.top + 16,
            bottom: MediaQuery.of(context).padding.bottom + 16),
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
                ),
                SizedBox(
                  width: 10,
                ),
                Text(
                  "Fill Your Profile",
                  style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                ),
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
                        ? ConstanceData.s12
                        : ConstanceData.s12,
                    height: 120,
                  ),
                  SizedBox(
                    height: 20,
                  ),
                  MyTextFieald(
                    hintText: "Full Name",
                    prefixIcon: null,
                    suffixIcon: SizedBox(),
                    click: () {},
                  ),
                  SizedBox(
                    height: 20,
                  ),
                  MyTextFieald(
                    hintText: "Nickname",
                    prefixIcon: null,
                    suffixIcon: SizedBox(),
                    click: () {},
                  ),
                  SizedBox(
                    height: 20,
                  ),
                  MyTextFieald(
                    hintText: "Date of Birth",
                    prefixIcon: null,
                    click: () {},
                    suffixIcon: IconButton(
                      icon: AppTheme.isLightTheme
                          ? Image.asset(
                              ConstanceData.s13,
                              height: 15,
                            )
                          : Image.asset(
                              ConstanceData.s13,
                              height: 15,
                            ),
                      onPressed: () {},
                    ),

                    // click: click
                  ),
                  SizedBox(
                    height: 20,
                  ),
                  MyTextFieald(
                    hintText: "Email",
                    prefixIcon: null,
                    click: () {},
                    suffixIcon: IconButton(
                      icon: AppTheme.isLightTheme
                          ? Image.asset(
                              ConstanceData.s14,
                              height: 15,
                            )
                          : Image.asset(
                              ConstanceData.s14,
                              height: 15,
                            ),
                      onPressed: () {},
                    ),

                    // click: click
                  ),
                  SizedBox(
                    height: 20,
                  ),
                  MyTextFieald(
                    hintText: "Phone Number",
                    prefixIcon: IconButton(
                      icon: AppTheme.isLightTheme
                          ? Image.asset(
                              ConstanceData.s15,
                              height: 25,
                            )
                          : Image.asset(
                              ConstanceData.ds15,
                              height: 25,
                            ),
                      onPressed: () {},
                    ),
                    suffixIcon: SizedBox(),
                    click: () {},
                  ),
                  SizedBox(
                    height: 20,
                  ),
                  MyTextFieald(
                    hintText: "Gender",
                    prefixIcon: null,
                    click: () {},
                    suffixIcon: IconButton(
                      icon: AppTheme.isLightTheme
                          ? Image.asset(
                              ConstanceData.s16,
                              height: 20,
                            )
                          : Image.asset(
                              ConstanceData.s16,
                              height: 20,
                            ),
                      onPressed: () {},
                    ),

                    // click: click
                  ),
                ],
              ),
            ),
            SizedBox(
              height: 20,
            ),
            MyButton(
                btnName: "Continue",
                click: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => SetYourLocationScreen(),
                    ),
                  );
                }),
          ],
        ),
      ),
    );
  }
}
