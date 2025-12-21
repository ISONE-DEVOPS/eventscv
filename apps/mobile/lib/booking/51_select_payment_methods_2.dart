// ignore_for_file: prefer_const_constructors_in_immutables, prefer_const_constructors, prefer_const_literals_to_create_immutables, deprecated_member_use, file_names

import 'package:eveno/Constance/constance.dart';
import 'package:eveno/Constance/theme.dart';
import 'package:eveno/Widget/buttons.dart';
import 'package:eveno/booking/52_review_summary.dart';
import 'package:flutter/material.dart';

class SelectPaymentMethod2 extends StatefulWidget {
  SelectPaymentMethod2({Key? key}) : super(key: key);

  @override
  State<SelectPaymentMethod2> createState() => _SelectPaymentMethod2State();
}

class _SelectPaymentMethod2State extends State<SelectPaymentMethod2> {
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
                  "Payments",
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
                  height: 30,
                ),
              ],
            ),
            SizedBox(
              height: 30,
            ),
            Expanded(
              child: ListView(
                padding: EdgeInsets.all(0),
                children: [
                  Text(
                    "Select the top up method you want to use.",
                    style: Theme.of(context)
                        .textTheme
                        .bodyLarge!
                        .copyWith(fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(
                    height: 30,
                  ),
                  com(
                      ConstanceData.k21,
                      AppTheme.isLightTheme
                          ? ConstanceData.k25
                          : ConstanceData.k25,
                      "PayPal",
                      ""),
                  SizedBox(
                    height: 30,
                  ),
                  com(
                      ConstanceData.k22,
                      AppTheme.isLightTheme
                          ? ConstanceData.k25
                          : ConstanceData.k25,
                      "Google Pay",
                      ""),
                  SizedBox(
                    height: 30,
                  ),
                  com(
                      AppTheme.isLightTheme
                          ? ConstanceData.k23
                          : ConstanceData.k21,
                      AppTheme.isLightTheme
                          ? ConstanceData.k25
                          : ConstanceData.k25,
                      "Apple Pay",
                      ""),
                  SizedBox(
                    height: 30,
                  ),
                  com(
                      AppTheme.isLightTheme
                          ? ConstanceData.k27
                          : ConstanceData.dk27,
                      AppTheme.isLightTheme
                          ? ConstanceData.k24
                          : ConstanceData.k24,
                      "•••• •••• •••• •••• 4679",
                      ""),
                  SizedBox(
                    height: 20,
                  ),
                  SizedBox(
                    height: 20,
                  ),
                  Container(
                    height: 50,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: AppTheme.isLightTheme
                          ? Color.fromARGB(255, 238, 237, 250)
                          : Theme.of(context).disabledColor,
                      borderRadius: BorderRadius.all(Radius.circular(28)),
                    ),
                    child: Center(
                      child: Text(
                        "Add New Card",
                        style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                              fontSize: 16,
                              color: AppTheme.isLightTheme
                                  ? Theme.of(context).primaryColor
                                  : Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            MyButton(
                btnName: "Continue",
                click: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => ReviewSummaryScreen(),
                    ),
                  );
                })
          ],
        ),
      ),
    );
  }

  Widget com(
    String img,
    String img2,
    String tex1,
    String tex3,
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
                tex3,
                style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
              ),
              SizedBox(
                width: 10,
              ),
              Image.asset(
                img2,
                height: 20,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
