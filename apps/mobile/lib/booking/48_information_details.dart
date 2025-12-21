// ignore_for_file: prefer_const_constructors, deprecated_member_use, file_names

import 'package:eveno/Constance/constance.dart';
import 'package:eveno/Constance/theme.dart';
import 'package:eveno/Widget/buttons.dart';
import 'package:eveno/Widget/textFiealds.dart';
import 'package:eveno/booking/49_select_payment_methods.dart';
import 'package:flutter/material.dart';

class InformationDetailScreen extends StatefulWidget {
  const InformationDetailScreen({super.key});

  @override
  State<InformationDetailScreen> createState() =>
      _InformationDetailScreenState();
}

class _InformationDetailScreenState extends State<InformationDetailScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: EdgeInsets.only(
            left: 16,
            right: 16,
            top: MediaQuery.of(context).padding.top + 20,
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
                  "Book Event",
                  style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                ),
              ],
            ),
            SizedBox(
              height: 30,
            ),
            Expanded(
              child: ListView(
                children: [
                  Text(
                    "Contact Information",
                    style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                          fontSize: 14,
                        ),
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
                    hintText: "State",
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
                  SizedBox(
                    height: 30,
                  ),
                  Row(
                    children: [
                      Image.asset(
                        ConstanceData.k19,
                        height: 20,
                      ),
                      SizedBox(
                        width: 10,
                      ),
                      Text(
                        "I accept the Eveno Terms of Service,\n Community Guidelines, and Privacy \nPolicy (Required)",
                        style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                    ],
                  ),
                  SizedBox(
                    height: 30,
                  ),
                  MyButton(
                      btnName: "Continue",
                      click: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => SelectPaymentMethod(),
                          ),
                        );
                      }),
                  SizedBox(
                    height: 30,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
