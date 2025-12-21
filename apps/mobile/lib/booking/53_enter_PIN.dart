// ignore_for_file: prefer_const_constructors_in_immutables, prefer_const_constructors, deprecated_member_use, file_names

import 'package:eveno/Constance/constance.dart';
import 'package:eveno/Constance/theme.dart';
import 'package:eveno/Widget/buttons.dart';
import 'package:eveno/booking/56_view_e-ticket_full_page_version1.dart';
import 'package:flutter/material.dart';
import 'package:flutter_otp_text_field/flutter_otp_text_field.dart';

class EnterPinScreen extends StatefulWidget {
  EnterPinScreen({Key? key}) : super(key: key);

  @override
  State<EnterPinScreen> createState() => _EnterPinScreenState();
}

class _EnterPinScreenState extends State<EnterPinScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: InkWell(
        onTap: () {
          FocusScope.of(context).unfocus();
        },
        child: ListView(
          padding: EdgeInsets.only(
              left: 16,
              right: 16,
              top: MediaQuery.of(context).padding.top + 16,
              bottom: MediaQuery.of(context).padding.bottom + 16),
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
                  "Enter Your PIN",
                  style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                ),
              ],
            ),
            SizedBox(
              height: 50,
            ),
            Text(
              "Enter your PIN to confirm payment",
              textAlign: TextAlign.center,
              style: Theme.of(context)
                  .textTheme
                  .bodyLarge!
                  .copyWith(fontSize: 12, fontWeight: FontWeight.bold),
            ),
            SizedBox(
              height: 60,
            ),
            OtpTextField(
              numberOfFields: 4,
              focusedBorderColor: Theme.of(context).primaryColor,
              showFieldAsBox: true,
              fieldWidth: 70,
              autoFocus: true,
              textStyle: Theme.of(context).textTheme.bodyLarge!.copyWith(
                    color: Theme.of(context).primaryColor,
                    fontSize: 18,
                  ),
              // fillColor: HexColor("#FAFAFC"),
              keyboardType: TextInputType.number,
              borderRadius: BorderRadius.circular(20),
            ),
            SizedBox(
              height: 40,
            ),
            MyButton(
                btnName: "Continue",
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
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Image.asset(
                                    AppTheme.isLightTheme
                                        ? ConstanceData.k29
                                        : ConstanceData.k29,
                                    height: 140,
                                  ),
                                ],
                              ),
                              SizedBox(
                                height: 10,
                              ),
                              Text(
                                "Oops, Failed!",
                                style: Theme.of(context)
                                    .textTheme
                                    .bodyLarge!
                                    .copyWith(
                                      fontSize: 14,
                                      color: HexColor("#F75555"),
                                      fontWeight: FontWeight.bold,
                                    ),
                              ),
                              SizedBox(
                                height: 10,
                              ),
                              Text(
                                "Your payment failed.Please check your internet connection then try again.",
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
                                  btnName: "Try Again",
                                  click: () {
                                    showDialog(
                                        context: context,
                                        builder: (ctx) => AlertDialog(
                                              actions: <Widget>[
                                                Padding(
                                                  padding:
                                                      const EdgeInsets.all(15),
                                                  child: Column(
                                                    crossAxisAlignment:
                                                        CrossAxisAlignment
                                                            .center,
                                                    children: [
                                                      Row(
                                                        mainAxisAlignment:
                                                            MainAxisAlignment
                                                                .center,
                                                        children: [
                                                          Image.asset(
                                                            AppTheme.isLightTheme
                                                                ? ConstanceData
                                                                    .k30
                                                                : ConstanceData
                                                                    .k30,
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
                                                              color: Theme.of(
                                                                      context)
                                                                  .primaryColor,
                                                              fontWeight:
                                                                  FontWeight
                                                                      .bold,
                                                            ),
                                                      ),
                                                      SizedBox(
                                                        height: 10,
                                                      ),
                                                      Text(
                                                        "You have successfully placed an order for National Music Festival. Enjoy the event!",
                                                        textAlign:
                                                            TextAlign.center,
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
                                                          btnName:
                                                              "View E-Ticket",
                                                          click: () {
                                                            Navigator.push(
                                                              context,
                                                              MaterialPageRoute(
                                                                builder: (_) =>
                                                                    EReceiptScreen(),
                                                              ),
                                                            );
                                                          }),
                                                      SizedBox(
                                                        height: 10,
                                                      ),
                                                      InkWell(
                                                        onTap: () {
                                                          Navigator.pop(
                                                              context);
                                                        },
                                                        child: Container(
                                                          height: 50,
                                                          width:
                                                              double.infinity,
                                                          decoration:
                                                              BoxDecoration(
                                                            color: AppTheme
                                                                    .isLightTheme
                                                                ? Color
                                                                    .fromARGB(
                                                                        255,
                                                                        238,
                                                                        237,
                                                                        250)
                                                                : Theme.of(
                                                                        context)
                                                                    .disabledColor,
                                                            borderRadius:
                                                                BorderRadius
                                                                    .all(Radius
                                                                        .circular(
                                                                            28)),
                                                          ),
                                                          child: Center(
                                                            child: Text(
                                                              "Cancel",
                                                              style: Theme.of(
                                                                      context)
                                                                  .textTheme
                                                                  .bodyLarge!
                                                                  .copyWith(
                                                                    fontSize:
                                                                        14,
                                                                    color: AppTheme.isLightTheme
                                                                        ? Theme.of(context)
                                                                            .primaryColor
                                                                        : Colors
                                                                            .white,
                                                                    fontWeight:
                                                                        FontWeight
                                                                            .bold,
                                                                  ),
                                                            ),
                                                          ),
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                )
                                              ],
                                            ));
                                  }),
                              SizedBox(
                                height: 10,
                              ),
                              InkWell(
                                onTap: () {
                                  Navigator.pop(context);
                                },
                                child: Container(
                                  height: 50,
                                  width: double.infinity,
                                  decoration: BoxDecoration(
                                    color: AppTheme.isLightTheme
                                        ? Color.fromARGB(255, 238, 237, 250)
                                        : Theme.of(context).disabledColor,
                                    borderRadius:
                                        BorderRadius.all(Radius.circular(28)),
                                  ),
                                  child: Center(
                                    child: Text(
                                      "Cancel",
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodyLarge!
                                          .copyWith(
                                            fontSize: 14,
                                            color: AppTheme.isLightTheme
                                                ? Theme.of(context).primaryColor
                                                : Colors.white,
                                            fontWeight: FontWeight.bold,
                                          ),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        )
                      ],
                    ),
                  );
                })
          ],
        ),
      ),
    );
  }
}
