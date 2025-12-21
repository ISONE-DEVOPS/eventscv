// ignore_for_file: prefer_const_constructors, deprecated_member_use

import 'package:eveno/Constance/constance.dart';
import 'package:eveno/Constance/theme.dart';
import 'package:eveno/Widget/buttons.dart';
import 'package:eveno/Widget/textFiealds.dart';
import 'package:eveno/auth/fill_your_profile.dart';
import 'package:eveno/auth/login_to_your_account.dart';
import 'package:flutter/material.dart';

class CreateNewAccountScreen extends StatefulWidget {
  const CreateNewAccountScreen({super.key});

  @override
  State<CreateNewAccountScreen> createState() => _CreateNewAccountScreenState();
}

class _CreateNewAccountScreenState extends State<CreateNewAccountScreen> {
  bool _isChecked = true;
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
              height: 20,
            ),
            Expanded(
              child: ListView(
                padding: EdgeInsets.zero,
                children: [
                  Image.asset(
                    ConstanceData.s6,
                    height: 70,
                  ),
                  SizedBox(
                    height: 20,
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        "Create New Account",
                        style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                    ],
                  ),
                  SizedBox(
                    height: 40,
                  ),
                  MyTextFieald(
                    hintText: "Email",

                    click: () {},
                    suffixIcon: SizedBox(),
                    prefixIcon: IconButton(
                      icon: AppTheme.isLightTheme
                          ? Image.asset(
                              ConstanceData.s7,
                              height: 15,
                            )
                          : Image.asset(
                              ConstanceData.s7,
                              height: 25,
                            ),
                      onPressed: () {},
                    ),
                    // click: click
                  ),
                  SizedBox(
                    height: 20,
                  ),
                  MyTextFieald(
                    hintText: "Password",

                    click: () {},
                    suffixIcon: IconButton(
                      icon: AppTheme.isLightTheme
                          ? Image.asset(
                              ConstanceData.s9,
                              height: 15,
                            )
                          : Image.asset(
                              ConstanceData.s9,
                              height: 25,
                            ),
                      onPressed: () {},
                    ),
                    prefixIcon: IconButton(
                      icon: AppTheme.isLightTheme
                          ? Image.asset(
                              ConstanceData.s8,
                              height: 15,
                            )
                          : Image.asset(
                              ConstanceData.s8,
                              height: 25,
                            ),
                      onPressed: () {},
                    ),
                    // click: click
                  ),
                  SizedBox(
                    height: 20,
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _isChecked
                          ? InkWell(
                              onTap: () {
                                setState(() {
                                  _isChecked = false;
                                });
                              },
                              child: Image.asset(
                                ConstanceData.s10,
                                height: 20,
                              ),
                            )
                          : InkWell(
                              onTap: () {
                                setState(() {
                                  _isChecked = true;
                                });
                              },
                              child: Image.asset(
                                ConstanceData.s11,
                                height: 20,
                              ),
                            ),
                      SizedBox(
                        width: 10,
                      ),
                      Text(
                        "Remember me",
                        style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                      )
                    ],
                  ),
                  SizedBox(
                    height: 20,
                  ),
                  MyButton(
                      btnName: "Sign up",
                      click: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => FillYourProfileScreen(),
                          ),
                        );
                      }),
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
                        width: 20,
                      ),
                      Text(
                        "or continue with",
                        style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Theme.of(context).disabledColor),
                      ),
                      SizedBox(
                        width: 20,
                      ),
                      Expanded(
                        child: Container(
                          height: 1,
                          color: Theme.of(context).dividerColor,
                        ),
                      ),
                    ],
                  ),
                  SizedBox(
                    height: 30,
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        height: 60,
                        width: 80,
                        decoration: BoxDecoration(
                          color: AppTheme.isLightTheme
                              ? Colors.white
                              : HexColor("#35383F"),
                          border:
                              Border.all(color: Theme.of(context).dividerColor),
                          borderRadius: BorderRadius.all(Radius.circular(20)),
                        ),
                        child: Center(
                          child: Image.asset(
                            ConstanceData.s3,
                            height: 25,
                          ),
                        ),
                      ),
                      SizedBox(
                        width: 20,
                      ),
                      Container(
                        height: 60,
                        width: 80,
                        decoration: BoxDecoration(
                          color: AppTheme.isLightTheme
                              ? Colors.white
                              : HexColor("#35383F"),
                          border:
                              Border.all(color: Theme.of(context).dividerColor),
                          borderRadius: BorderRadius.all(Radius.circular(20)),
                        ),
                        child: Center(
                          child: Image.asset(
                            ConstanceData.s4,
                            height: 25,
                          ),
                        ),
                      ),
                      SizedBox(
                        width: 20,
                      ),
                      Container(
                        height: 60,
                        width: 80,
                        decoration: BoxDecoration(
                          color: AppTheme.isLightTheme
                              ? Colors.white
                              : HexColor("#35383F"),
                          border:
                              Border.all(color: Theme.of(context).dividerColor),
                          borderRadius: BorderRadius.all(Radius.circular(20)),
                        ),
                        child: Center(
                          child: Image.asset(
                            AppTheme.isLightTheme
                                ? ConstanceData.s5
                                : ConstanceData.ds5,
                            height: 25,
                          ),
                        ),
                      ),
                    ],
                  ),
                  SizedBox(
                    height: 30,
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        "Already have an account?",
                        style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                            fontSize: 12,
                            color: Theme.of(context).disabledColor),
                      ),
                      SizedBox(
                        width: 10,
                      ),
                      InkWell(
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => LoginToYourAccountScreen(),
                            ),
                          );
                        },
                        child: Text(
                          "Sign In",
                          style: Theme.of(context)
                              .textTheme
                              .bodyLarge!
                              .copyWith(
                                  fontSize: 14,
                                  color: Theme.of(context).primaryColor,
                                  fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                  SizedBox(
                    height: 30,
                  )
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
