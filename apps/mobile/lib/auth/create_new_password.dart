// ignore_for_file: prefer_const_constructors_in_immutables, prefer_const_constructors, deprecated_member_use, use_build_context_synchronously

import 'package:eveno/Constance/constance.dart';
import 'package:eveno/Constance/theme.dart';
import 'package:eveno/Widget/buttons.dart';
import 'package:eveno/Widget/textFiealds.dart';
import 'package:eveno/main.dart';
import 'package:flutter/material.dart';

class CreateNewPassword extends StatefulWidget {
  CreateNewPassword({Key? key}) : super(key: key);

  @override
  State<CreateNewPassword> createState() => _CreateNewPasswordState();
}

class _CreateNewPasswordState extends State<CreateNewPassword> {
  bool _isChecked = true;
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
          crossAxisAlignment: CrossAxisAlignment.start,
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
                  "Create New Password",
                  style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                ),
              ],
            ),
            SizedBox(
              height: 60,
            ),
            Expanded(
              child: ListView(
                padding: EdgeInsets.zero,
                children: [
                  Image.asset(AppTheme.isLightTheme
                      ? ConstanceData.s33
                      : ConstanceData.ds33),
                  SizedBox(
                    height: 60,
                  ),
                  Text(
                    "Create Your New Password",
                    style: Theme.of(context)
                        .textTheme
                        .bodyLarge!
                        .copyWith(fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(
                    height: 20,
                  ),
                  MyTextFieald(
                    hintText: "Password",
                    prefixIcon: IconButton(
                      icon: AppTheme.isLightTheme
                          ? Image.asset(
                              ConstanceData.s34,
                              height: 15,
                            )
                          : Image.asset(
                              ConstanceData.ds34,
                              height: 15,
                            ),
                      onPressed: () {},
                    ),
                    click: () {},
                    suffixIcon: IconButton(
                      icon: AppTheme.isLightTheme
                          ? Image.asset(
                              ConstanceData.s35,
                              height: 15,
                            )
                          : Image.asset(
                              ConstanceData.ds35,
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
                    hintText: "Password",
                    prefixIcon: IconButton(
                      icon: AppTheme.isLightTheme
                          ? Image.asset(
                              ConstanceData.s34,
                              height: 15,
                            )
                          : Image.asset(
                              ConstanceData.ds34,
                              height: 15,
                            ),
                      onPressed: () {},
                    ),
                    click: () {},
                    suffixIcon: IconButton(
                      icon: AppTheme.isLightTheme
                          ? Image.asset(
                              ConstanceData.s35,
                              height: 15,
                            )
                          : Image.asset(
                              ConstanceData.ds35,
                              height: 15,
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
                                AppTheme.isLightTheme
                                    ? ConstanceData.s10
                                    : ConstanceData.s11,
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
                      ),
                    ],
                  ),
                ],
              ),
            ),
            MyButton(
                btnName: "Continue",
                click: () async {
                  showDialog(
                    context: context,
                    builder: (ctx) => AlertDialog(
                      actions: <Widget>[
                        Padding(
                          padding: const EdgeInsets.all(15),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Image.asset(
                                    AppTheme.isLightTheme
                                        ? ConstanceData.s36
                                        : ConstanceData.s36,
                                    height: 140,
                                  ),
                                ],
                              ),
                              SizedBox(
                                height: 10,
                              ),
                              Text(
                                "Congratulations!",
                                style: Theme.of(context)
                                    .textTheme
                                    .bodyLarge!
                                    .copyWith(
                                      fontSize: 14,
                                      color: Theme.of(context).primaryColor,
                                      fontWeight: FontWeight.bold,
                                    ),
                              ),
                              SizedBox(
                                height: 10,
                              ),
                              Text(
                                "Your account is ready to use. You will be redirected to the Home page in a few seconds..",
                                textAlign: TextAlign.center,
                                style: Theme.of(context)
                                    .textTheme
                                    .bodyLarge!
                                    .copyWith(
                                      fontSize: 12,
                                    ),
                              ),
                              SizedBox(
                                height: 20,
                              ),
                              Image.asset(
                                AppTheme.isLightTheme
                                    ? ConstanceData.logo2
                                    : ConstanceData.logo2,
                                height: 50,
                              ),
                            ],
                          ),
                        )
                      ],
                    ),
                  );
                  await Future.delayed(Duration(milliseconds: 2000));
                  Navigator.pushReplacementNamed(context, Routes.HOME);
                }),
            SizedBox(
              height: 10,
            ),
          ],
        ),
      ),
    );
  }
}
