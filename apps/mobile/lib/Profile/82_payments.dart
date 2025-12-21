// ignore_for_file: prefer_const_constructors_in_immutables, prefer_const_constructors, prefer_const_literals_to_create_immutables, deprecated_member_use, file_names

import 'package:eveno/Constance/constance.dart';
import 'package:eveno/Constance/theme.dart';
import 'package:eveno/Widget/buttons.dart';
import 'package:flutter/material.dart';

class SettingsPayment extends StatefulWidget {
  SettingsPayment({Key? key}) : super(key: key);

  @override
  State<SettingsPayment> createState() => _SettingsPaymentState();
}

class _SettingsPaymentState extends State<SettingsPayment> {
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
                  "Payment",
                  style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                ),
                Spacer(),
                Image.asset(
                  AppTheme.isLightTheme
                      ? ConstanceData.k20
                      : ConstanceData.dk20,
                  height: 25,
                )
              ],
            ),
            SizedBox(
              height: 30,
            ),
            Expanded(
              child: ListView(
                padding: EdgeInsets.zero,
                children: [
                  com(ConstanceData.r1, "PayPal"),
                  SizedBox(
                    height: 20,
                  ),
                  com(ConstanceData.r2, "Google Pay"),
                  SizedBox(
                    height: 20,
                  ),
                  com(
                    AppTheme.isLightTheme ? ConstanceData.r3 : ConstanceData.r3,
                    "Apple Pay",
                  ),
                  SizedBox(
                    height: 20,
                  ),
                  com(
                    AppTheme.isLightTheme ? ConstanceData.r4 : ConstanceData.r4,
                    "•••• •••• •••• •••• 4679",
                  ),
                  SizedBox(
                    height: 20,
                  ),
                  com(
                    AppTheme.isLightTheme ? ConstanceData.r4 : ConstanceData.r4,
                    "•••• •••• •••• •••• 2766",
                  ),
                  SizedBox(
                    height: 20,
                  ),
                  com(
                    AppTheme.isLightTheme ? ConstanceData.r4 : ConstanceData.r4,
                    "•••• •••• •••• •••• 3892",
                  ),
                ],
              ),
            ),
            SizedBox(
              height: 20,
            ),
            MyButton(
                btnName: "Add New Account",
                click: () {
                  // Navigator.push(
                  //   context,
                  //   MaterialPageRoute(
                  //     builder: (_) => SettingPaymentAddNewCard(),
                  //   ),
                  // );
                })
          ],
        ),
      ),
    );
  }

  Widget com(
    String img,
    String tex1,
  ) {
    return Container(
      height: 60,
      width: double.infinity,
      decoration: BoxDecoration(
        boxShadow: [
          BoxShadow(
            color: AppTheme.isLightTheme
                ? Color.fromARGB(255, 231, 231, 231)
                : Colors.transparent,
            blurRadius: 6.0,
            spreadRadius: 2.0,
            offset: Offset(0.0, 0.0),
          )
        ],
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.all(Radius.circular(20)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Center(
          child: Row(
            children: [
              Image.asset(
                img,
                height: 50,
              ),
              SizedBox(
                width: 10,
              ),
              Text(
                tex1,
                style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
              ),
              Spacer(),
              Text(
                "Connected",
                style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                      fontSize: 12,
                      color: Theme.of(context).primaryColor,
                      fontWeight: FontWeight.bold,
                    ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
