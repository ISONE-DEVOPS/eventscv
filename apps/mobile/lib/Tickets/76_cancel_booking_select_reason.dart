// ignore_for_file: prefer_const_constructors, deprecated_member_use, file_names

import 'package:eveno/Constance/constance.dart';
import 'package:eveno/Constance/theme.dart';
import 'package:eveno/Widget/buttons.dart';
import 'package:flutter/material.dart';

class CencleBookingSelectReason extends StatefulWidget {
  const CencleBookingSelectReason({super.key});

  @override
  State<CencleBookingSelectReason> createState() =>
      _CencleBookingSelectReasonState();
}

class _CencleBookingSelectReasonState extends State<CencleBookingSelectReason> {
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
                  "Cancel Booking",
                  style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                ),
              ],
            ),
            SizedBox(
              height: 20,
            ),
            Text(
              "Please select the reason for cancellation:",
              style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
            ),
            SizedBox(
              height: 20,
            ),
            Divider(),
            SizedBox(
              height: 20,
            ),
            Expanded(
              child: ListView(
                padding: EdgeInsets.zero,
                children: [
                  Row(
                    children: [
                      Image.asset(
                        ConstanceData.k24,
                        height: 20,
                      ),
                      SizedBox(
                        width: 10,
                      ),
                      Text(
                        "I have another event, so it collides",
                        style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                    ],
                  ),
                  SizedBox(
                    height: 20,
                  ),
                  com("I'm sick, can't come"),
                  SizedBox(
                    height: 20,
                  ),
                  com("I have an urgent need"),
                  SizedBox(
                    height: 20,
                  ),
                  com("I have no transportation to come"),
                  SizedBox(
                    height: 20,
                  ),
                  com("I have no friends to come"),
                  SizedBox(
                    height: 20,
                  ),
                  com("I want to book another event "),
                  SizedBox(
                    height: 20,
                  ),
                  com("I just want to cancel"),
                  SizedBox(
                    height: 20,
                  ),
                  Text(
                    "Others",
                    style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  SizedBox(
                    height: 20,
                  ),
                  Container(
                    height: 100,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: AppTheme.isLightTheme
                          ? HexColor("#FAFAFA")
                          : HexColor("#35383F"),
                      borderRadius: BorderRadius.all(Radius.circular(28)),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Text(
                        "Others reason...",
                        style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                            fontSize: 12,
                            color: Theme.of(context).disabledColor),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            MyButton(
                btnName: "Cancel Booking",
                click: () {
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
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        Image.asset(
                                          AppTheme.isLightTheme
                                              ? ConstanceData.k30
                                              : ConstanceData.k30,
                                          height: 140,
                                        ),
                                      ],
                                    ),
                                    SizedBox(
                                      height: 10,
                                    ),
                                    Text(
                                      "Successful!",
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodyLarge!
                                          .copyWith(
                                            fontSize: 14,
                                            color:
                                                Theme.of(context).primaryColor,
                                            fontWeight: FontWeight.bold,
                                          ),
                                    ),
                                    SizedBox(
                                      height: 10,
                                    ),
                                    Text(
                                      "You have successfully canceled the event. 80% of the funds will be returned to your account.",
                                      textAlign: TextAlign.center,
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodyLarge!
                                          .copyWith(
                                            fontSize: 14,
                                          ),
                                    ),
                                    SizedBox(
                                      height: 20,
                                    ),
                                    MyButton(
                                        btnName: "OK",
                                        click: () {
                                          Navigator.pop(context);
                                        }),
                                    SizedBox(
                                      height: 10,
                                    ),
                                  ],
                                ),
                              )
                            ],
                          ));
                })
          ],
        ),
      ),
    );
  }

  Widget com(String tex) {
    return Row(
      children: [
        Image.asset(
          ConstanceData.k25,
          height: 20,
        ),
        SizedBox(
          width: 10,
        ),
        Text(
          tex,
          style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                fontSize: 14,
                fontWeight: FontWeight.bold,
              ),
        ),
      ],
    );
  }
}
